
from flask import Flask, Response, request, jsonify, session, send_from_directory, redirect, abort
from werkzeug.middleware.proxy_fix import ProxyFix
from flask_cors import CORS
import os
from functools import wraps  # для декоратора admin_only
import re
import json
import logging
from datetime import timedelta  #срок жизни сессии
from decimal import Decimal, InvalidOperation
from psycopg.errors import UniqueViolation
from config import CONFIG_PATH, IMAGES_DIR, SECRET_KEY, ADMIN_PASSWORD, ADMIN_PASSWORD_HASH, SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_BUCKET  # [БЕЗОП] ADMIN_PASSWORD_HASH — хеш пароля
from db import init_db
import seo  # метатеги, robots.txt, sitemap.xml
import security
from services.shop_service import ShopService
from models.product import PRODUCT_STATUSES
from services.order_service import OrderService

app = Flask(
    __name__,
    static_folder=None,
)
app.secret_key = SECRET_KEY
# за прокси хостинга (Render и т.п.) берём настоящие схему и хост, чтобы ссылки в SEO были https [SEO]
# x_for — настоящий IP посетителя, нужен для ограничения попыток входа. [БЕЗОП]
# Приложение должно стоять за одним прокси, иначе заголовок можно подделать. [БЕЗОП]
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1)  # [SEO] [БЕЗОП]
app.config.update(
    SESSION_COOKIE_SAMESITE='Lax',  # [БЕЗОП] cookie не уходит с чужих сайтов
    SESSION_COOKIE_HTTPONLY=True,  # [БЕЗОП] cookie недоступна из JS
    # на http://localhost secure-cookie не сохраняется, поэтому для локальной разработки можно отключить [БЕЗОП]
    SESSION_COOKIE_SECURE=os.getenv("SESSION_COOKIE_SECURE", "true").lower() != "false",  # [БЕЗОП] cookie только по https
    MAX_CONTENT_LENGTH=20 * 1024 * 1024,  # [БЕЗОП] лимит размера запроса
    # вход администратора живёт 8 часов, потом пароль нужно ввести заново [БЕЗОП]
    PERMANENT_SESSION_LIFETIME=timedelta(hours=8),  # [БЕЗОП]
)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend", "dist")

DEV_ORIGINS = [re.compile(r"http://localhost:\d+")]  # [БЕЗОП] разрешённые адреса для разработки
CORS(
    app,
    supports_credentials=True,
    origins=[pattern.pattern for pattern in DEV_ORIGINS],  # [БЕЗОП]
    expose_headers=["Retry-After"],  # [БЕЗОП]
)
init_db()

shop = ShopService()
order_service = OrderService()
admin_password = security.AdminPassword(ADMIN_PASSWORD_HASH, ADMIN_PASSWORD)  # [БЕЗОП] argon2-хеш
# 5 неудачных попыток входа за 15 минут с одного IP, дальше пауза [БЕЗОП]
login_limiter = security.RateLimiter(limit=5, window=15 * 60)  # [БЕЗОП]
# защита от спама заказами [БЕЗОП]
order_limiter = security.RateLimiter(limit=10, window=60 * 60)  # [БЕЗОП]

DEFAULT_SETTINGS = {
    "shopName": "Магазин",
    "titleColor": "#0F8A87",
    "font": "'Cormorant Garamond', serif",
}
HEX_COLOR_RE = re.compile(r"^#[0-9a-fA-F]{6}$")  #  цвет только в формате #RRGGBB
FONT_RE = re.compile(r"^[\w '\"\-,]+$")
MAX_TITLE_LENGTH = 200
MAX_TEXT_LENGTH = 5000
MAX_DETAIL_LENGTH = 300


def is_admin():
    return session.get('is_admin', False)

def is_id(value):  # строгая проверка id
    return isinstance(value, int) and not isinstance(value, bool) and value > 0

def too_many_requests(limiter, key, message):
    wait = limiter.retry_after(key)
    if not wait:
        return None
    response = jsonify({'error': message})
    response.headers['Retry-After'] = str(wait)
    return response, 429

def invalid_images(files):
    for file in files:
        if file and file.filename and not security.image_kind(file):  # [БЕЗОП]
            return jsonify({'error': f'Файл «{file.filename}» не является картинкой (JPEG, PNG, WebP, GIF)'}), 400  # [БЕЗОП]
    return None  # [БЕЗОП]

def admin_only(view):  # декоратор проверки
    @wraps(view)
    def wrapper(*args, **kwargs):
        if not is_admin():
            return jsonify({'error': 'Unauthorized'}), 401
        return view(*args, **kwargs)
    return wrapper

def parse_price(value):
    """Возвращает Decimal или None, если цена некорректна."""
    if value is None:
        return None
    try:
        price = Decimal(str(value).replace(',', '.').strip())
    except (InvalidOperation, ValueError):
        return None
    if not price.is_finite() or price < 0 or price >= Decimal('100000000'):
        return None
    return price.quantize(Decimal('0.01'))

def clean_text(value):
    return value.strip() if isinstance(value, str) else ''

def parse_product(source, category_id):
    """Название, цена, описание, категория и детали. Возвращает (fields, error)."""
    title = clean_text(source.get('title'))
    price = parse_price(source.get('price'))
    description = clean_text(source.get('description'))
    if not title:
        return None, 'Title is required'
    if len(title) > MAX_TITLE_LENGTH or len(description) > MAX_TEXT_LENGTH:
        return None, 'Title or description is too long'
    if price is None:
        return None, 'Price must be a non-negative number'
    if not is_id(category_id) or not shop.category_exists(category_id):
        return None, 'Category is required'
    details, error = parse_details(source)
    if error:
        return None, error
    return dict(title=title, price=price, description=description, category_id=category_id, **details), None

def parse_details(source):
    """Материалы, размеры и статус товара. Возвращает (details, error)."""
    details = {
        'materials': clean_text(source.get('materials')),
        'dimensions': clean_text(source.get('dimensions')),
        'status': clean_text(source.get('status')) or 'available',
    }
    if details['status'] not in PRODUCT_STATUSES:
        return None, 'Unknown status'
    if len(details['materials']) > MAX_DETAIL_LENGTH or len(details['dimensions']) > MAX_DETAIL_LENGTH:
        return None, 'Materials or dimensions are too long'
    return details, None


@app.before_request
def redirect_to_main_mirror():
    target = seo.mirror_redirect(request)
    if target:
        return redirect(target, code=301)


@app.before_request
def csrf_protect():  # защита от CSRF
    if request.method not in security.UNSAFE_METHODS or not request.path.startswith('/api/'):  # [БЕЗОП]
        return None
    # запросы с чужих сайтов отклоняем всегда, даже без входа
    if not security.same_origin(request, DEV_ORIGINS):
        return jsonify({'error': 'Forbidden origin'}), 403
    # у администратора дополнительно проверяем токен из сессии
    if is_admin() and not security.csrf_valid(session, request.headers.get(security.CSRF_HEADER)):  # [БЕЗОП]
        return jsonify({'error': 'Invalid CSRF token'}), 403
    return None


@app.after_request
def add_security_headers(response):  # nosniff, запрет iframe, HSTS
    return security.security_headers(response, request.is_secure)


@app.errorhandler(413)
def file_too_large(_error):
    return jsonify({'error': 'Файлы слишком большие (максимум 20 МБ)'}), 413


@app.route('/api/products', methods=['GET'])
def get_products():
    products = shop.get_all_products()
    return jsonify([p.to_json() for p in products])

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = shop.get_product(product_id)
    if not product:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify(product.to_json())


@app.route('/images/<path:filename>')
def serve_image(filename):
    filename = os.path.basename(filename)  # нельзя выйти из папки картинок
    if SUPABASE_URL and SUPABASE_SERVICE_KEY:
        url = f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{filename}"
        resp = redirect(url, code=302)
        resp.headers['Cache-Control'] = 'public, max-age=86400'
        return resp
    if os.path.exists(os.path.join(IMAGES_DIR, filename)):
        return send_from_directory(IMAGES_DIR, filename)
    abort(404)


@app.route('/api/products', methods=['POST'])
@admin_only
def add_product():

    files = request.files.getlist('itemImages')
    bad_files = invalid_images(files)
    if bad_files:
        return bad_files
    fields, error = parse_product(request.form, request.form.get('category_id', type=int))  # [ОПТ]
    if error:
        return jsonify({'error': error}), 400
    product = shop.add_product(files=files, **fields)
    return jsonify(product.to_json()), 201

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@admin_only
def delete_product(product_id):
    if shop.delete_product(product_id):
        return jsonify({'message': f'Product {product_id} deleted'}), 200
    return jsonify({'error': 'Product not found'}), 404

@app.route('/api/products/<int:product_id>', methods=['PUT'])
@admin_only
def update_product(product_id):
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    fields, error = parse_product(data, data.get('category_id'))
    if error:
        return jsonify({'error': error}), 400
    if shop.update_product(product_id, **fields):
        return jsonify({'message': 'Product updated'}), 200
    return jsonify({'error': 'Product not found'}), 404

@app.route('/api/products/<int:product_id>/images', methods=['POST'])
@admin_only
def add_product_images(product_id):
    files = request.files.getlist('itemImages')
    if not files or all(not f.filename for f in files):
        return jsonify({'error': 'No images provided'}), 400
    bad_files = invalid_images(files)
    if bad_files:
        return bad_files
    images = shop.add_images_to_product(product_id, files)
    if images is None:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'message': 'Images added', 'images': images}), 200

@app.route('/api/products/<int:product_id>/image/<int:image_index>', methods=['PUT'])
@admin_only
def replace_product_image(product_id, image_index):
    if 'itemImage' not in request.files:
        return jsonify({'error': 'File not found'}), 400
    new_file = request.files['itemImage']
    if not new_file.filename:
        return jsonify({'error': 'Empty filename'}), 400
    bad_files = invalid_images([new_file])
    if bad_files:
        return bad_files
    new_path = shop.replace_product_image(product_id, image_index, new_file)
    if new_path is None:
        return jsonify({'error': 'Product or image not found'}), 404
    return jsonify({'message': 'Image replaced', 'new_image': new_path}), 200

@app.route('/api/products/<int:product_id>/image/<int:image_index>', methods=['DELETE'])
@admin_only
def delete_product_image(product_id, image_index):
    if shop.delete_product_image(product_id, image_index):
        return jsonify({'message': 'Image deleted'}), 200
    return jsonify({'error': 'Product or image not found'}), 404

@app.route('/api/verify-admin', methods=['POST'])
def verify_admin():
    ip = request.remote_addr
    limited = too_many_requests(login_limiter, ip, 'Слишком много попыток входа. Попробуйте позже.')  # [БЕЗОП]
    if limited:
        return limited
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    if admin_password.verify(data.get('password')):
        login_limiter.reset(ip)
        # новая сессия при входе защищает от фиксации сессии
        session.clear()
        session.permanent = True
        session['is_admin'] = True
        return jsonify({
            'success': True,
            'message': 'Access allowed',
            'csrfToken': security.csrf_token(session),
        }), 200
    login_limiter.hit(ip)
    logging.warning("Failed admin login from %s", ip)
    return jsonify({
        'success': False,
        'message': 'Incorrect password'
    }), 403

@app.route('/api/check-admin', methods=['GET'])
def check_admin():
    if not is_admin():
        return jsonify({'isAdmin': False}), 200
    return jsonify({'isAdmin': True, 'csrfToken': security.csrf_token(session)}), 200  # CSRF-токен для фронтенда

@app.route('/api/orders', methods=['POST'])
def create_order():
    ip = request.remote_addr
    limited = too_many_requests(order_limiter, ip, 'Слишком много заказов. Попробуйте позже или свяжитесь с нами.')
    if limited:
        return limited
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    customer_name = clean_text(data.get('customer_name'))
    phone = re.sub(r'\D', '', str(data.get('phone') or ''))
    item_id = data.get('item_id')
    comment = clean_text(data.get('comment'))
    if not customer_name:
        return jsonify({'error': 'customer_name is required'}), 400
    if len(customer_name) > MAX_TITLE_LENGTH or len(comment) > MAX_TEXT_LENGTH:
        return jsonify({'error': 'Name or comment is too long'}), 400
    if not 10 <= len(phone) <= 15:
        return jsonify({'error': 'phone is invalid'}), 400
    if item_id is None:
        # индивидуальный заказ: без товара, но с описанием пожеланий
        if not comment:
            return jsonify({'error': 'Опишите, что вы хотите заказать'}), 400
    else:
        status = shop.get_product_status(item_id) if is_id(item_id) else None
        if status is None:
            return jsonify({'error': 'Product not found'}), 404
        if status == 'sold':
            return jsonify({'error': 'Этот товар уже продан'}), 409
    order = order_service.create_order(customer_name, phone, item_id, comment)
    if order:
        order_limiter.hit(ip)
        return jsonify(order.to_json()), 201
    return jsonify({'error': 'Failed to create order'}), 500

@app.route('/api/orders', methods=['GET'])
@admin_only
def get_orders():
    orders = order_service.get_all_orders()
    return jsonify([order.to_json() for order in orders])

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
@admin_only
def delete_order(order_id):
    if order_service.delete_order(order_id):
        return jsonify({'message': f'Order {order_id} deleted'}), 200
    return jsonify({'error': 'Order not found'}), 404

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = shop.get_all_categories()
    return jsonify([
        {
            'id': category['id'],
            'name': category['name']
        }
        for category in categories
    ])

@app.route('/api/categories', methods=['POST'])
@admin_only
def add_category():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    name = clean_text(data.get('name'))
    if not name:
        return jsonify({'error': 'Category name is required'}), 400
    if len(name) > MAX_TITLE_LENGTH:
        return jsonify({'error': 'Category name is too long'}), 400
    try:
        category_id = shop.add_category(name)
    except UniqueViolation:
        return jsonify({'error': 'Category already exists'}), 409
    return jsonify({
        'id': category_id,
        'name': name
    }), 201

@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
@admin_only
def delete_category(category_id):
    if shop.delete_category(category_id):
        return jsonify({
            'message': f'Category {category_id} deleted'
        }), 200
    return jsonify({
        'error': 'Category not found or contains products'
    }), 400

def read_settings():
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        data = {}
    return {key: data.get(key, default) for key, default in DEFAULT_SETTINGS.items()}

@app.route('/api/shopSettings', methods=['GET'])
def get_shop_settings():
    return jsonify(read_settings()), 200

@app.route('/api/shopSettings', methods=['PUT'])
@admin_only
def set_shop_settings():
    data = request.get_json(silent=True)
    if not data:
        return jsonify({"error": "No data provided"}), 400
    config = read_settings()

    shop_name = clean_text(data.get("shopName", config["shopName"]))
    title_color = data.get("titleColor", config["titleColor"])
    font = clean_text(data.get("font", config["font"]))
    if not shop_name or len(shop_name) > 60:
        return jsonify({"error": "Название магазина должно быть от 1 до 60 символов"}), 400
    if not isinstance(title_color, str) or not HEX_COLOR_RE.match(title_color):
        return jsonify({"error": "Некорректный цвет"}), 400
    if not font or len(font) > 100 or not FONT_RE.match(font):  # [БЕЗОП]
        return jsonify({"error": "Некорректный шрифт"}), 400

    config.update(shopName=shop_name, titleColor=title_color, font=font)
    try:
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
    except OSError:
        logging.exception("Failed to save shop settings")
        return jsonify({"error": "Не удалось сохранить настройки"}), 500
    return jsonify(config), 200

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out'}), 200

_index_cache = {"mtime": None, "html": ""}

def read_index_html():
    path = os.path.join(FRONTEND_DIR, "index.html")
    mtime = os.path.getmtime(path)
    if _index_cache["mtime"] != mtime:
        with open(path, encoding="utf-8") as f:
            _index_cache.update(mtime=mtime, html=f.read())
    return _index_cache["html"]

def render_index(status=200, **meta):
    return Response(seo.render_page(read_index_html(), **meta), status=status, mimetype="text/html")  # [ОПТ]

def noindex_page(status, title, description, path):
    shop_name = read_settings()["shopName"]
    return render_index(
        status,
        title=f"{title} | {shop_name}",
        description=description,
        url=f"{seo.base_url(request)}{path}",
        site_name=shop_name,
        noindex=True,
    )

@app.route("/")
def serve_frontend():
    meta = seo.home_meta(seo.base_url(request), read_settings())
    return render_index(**meta)

ITEM_REF_RE = re.compile(r"^(\d{1,9})(?:-.*)?$", re.S)

@app.route("/item/<path:item_ref>")
def serve_item_page(item_ref):
    """/item/12-zerkalo-v-rame. Любой другой адрес с тем же id (без slug, со старым slug) — 301 на канонический."""
    base = seo.base_url(request)
    match = ITEM_REF_RE.match(item_ref)
    product = shop.get_product(int(match.group(1))) if match else None
    if not product:
        return noindex_page(404, "Товар не найден", "Такого товара нет или он был удалён.", f"/item/{item_ref}")  # [ОПТ] [SEO] настоящий 404
    canonical_path = seo.item_path(product.id, product.title)
    if request.path != canonical_path:
        query = request.query_string.decode("latin-1")
        return redirect(f"{base}{canonical_path}{'?' + query if query else ''}", code=301)
    settings = read_settings()  # настройки читаются только когда товар найден
    categories = {c["id"]: c["name"] for c in shop.get_all_categories()}
    meta = seo.product_meta(base, settings, product, categories.get(product.category_id))
    return render_index(**meta)

@app.route("/adm")
def serve_admin_page():
    return noindex_page(200, "Вход для администратора", "", "/adm")

@app.route("/robots.txt")
def robots_txt():
    return Response(seo.robots_txt(seo.base_url(request)), mimetype="text/plain")

@app.route("/sitemap.xml")
def sitemap_xml():
    products = shop.get_all_products()
    return Response(seo.sitemap_xml(seo.base_url(request), products), mimetype="application/xml")

@app.route("/<path:path>")
def serve_react(path):
    # неизвестные API-адреса не должны отдавать index.html
    if path.startswith("api/"):
        return jsonify({'error': 'Not found'}), 404
    file_path = os.path.join(FRONTEND_DIR, path)
    if os.path.isfile(file_path):
        # у файлов сборки в имени есть хэш, поэтому их можно кэшировать надолго
        max_age = 31536000 if path.startswith("assets/") else 3600  # долгий кэш для файлов сборки
        return send_from_directory(FRONTEND_DIR, path, max_age=max_age)
    # неизвестный адрес: отдаём приложение, но просим не индексировать
    return noindex_page(404, "Страница не найдена", "", f"/{path}")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )
