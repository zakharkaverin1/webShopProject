from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv
from config import DATABASE_PATH, CONFIG_PATH, IMAGES_DIR
from services.shop_service import ShopService
from services.order_service import OrderService

load_dotenv()

app = Flask(
    __name__,
    static_folder=IMAGES_DIR,
    static_url_path="/images"
)
app.secret_key = os.getenv('SECRET_KEY', 'dev-secret-key-123')
app.config.update(
    SESSION_COOKIE_SAMESITE='Lax',
    SESSION_COOKIE_SECURE=True,
)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(BASE_DIR, "frontend", "dist")

CORS(
    app,
    supports_credentials=True,
    origins=[r"http://localhost:*"]
)

shop = ShopService()
order_service = OrderService()

def is_admin():
    return session.get('is_admin', False)

def admin_required():
    if not is_admin():
        return jsonify({'error': 'Unauthorized'}), 401
    return None

@app.route('/api/products', methods=['GET'])
def get_products():
    products = shop.get_all_products()
    return jsonify([p.to_json() for p in products])

@app.route('/api/products', methods=['POST'])
def add_product():
    auth = admin_required()
    if auth:
        return auth
    title = request.form.get('itemTitle')
    price = request.form.get('itemPrice')
    description = request.form.get('itemDescription')
    category_id = request.form.get('category_id', type=int)
    files = request.files.getlist('itemImages')
    if not title or not price:
        return jsonify({'error': 'Title and price are required'}), 400
    if not category_id:
        return jsonify({'error': 'Category is required'}), 400
    product = shop.add_product(
        title,
        price,
        description,
        category_id,
        files
    )
    return jsonify(product.to_json()), 201

@app.route('/api/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    auth = admin_required()
    if auth:
        return auth
    if shop.delete_product(product_id):
        return jsonify({'message': f'Product {product_id} deleted'}), 200
    return jsonify({'error': 'Product not found'}), 404

@app.route('/api/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    auth = admin_required()
    if auth:
        return auth
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    title = data.get('title')
    price = data.get('price')
    description = data.get('description', '')
    category_id = data.get('category_id')
    if not category_id:
        return jsonify({'error': 'Category is required'}), 400
    if shop.update_product(
            product_id,
            title,
            price,
            description,
            category_id
    ):return jsonify({'message': 'Product updated'}), 200
    return jsonify({'error': 'Product not found'}), 404

@app.route('/api/products/<int:product_id>/images', methods=['POST'])
def add_product_images(product_id):
    auth = admin_required()
    if auth:
        return auth
    files = request.files.getlist('itemImages')
    if not files or all(not f.filename for f in files):
        return jsonify({'error': 'No images provided'}), 400
    images = shop.add_images_to_product(product_id, files)
    if images is None:
        return jsonify({'error': 'Product not found'}), 404
    return jsonify({'message': 'Images added', 'images': images}), 200

@app.route('/api/products/<int:product_id>/image/<int:image_index>', methods=['PUT'])
def replace_product_image(product_id, image_index):
    auth = admin_required()
    if auth:
        return auth
    if 'itemImage' not in request.files:
        return jsonify({'error': 'File not found'}), 400
    new_file = request.files['itemImage']
    if not new_file.filename:
        return jsonify({'error': 'Empty filename'}), 400
    new_path = shop.replace_product_image(product_id, image_index, new_file)
    if new_path is None:
        return jsonify({'error': 'Product or image not found'}), 404
    return jsonify({'message': 'Image replaced', 'new_image': new_path}), 200

@app.route('/api/products/<int:product_id>/image/<int:image_index>', methods=['DELETE'])
def delete_product_image(product_id, image_index):
    auth = admin_required()
    if auth:
        return auth
    if shop.delete_product_image(product_id, image_index):
        return jsonify({'message': 'Image deleted'}), 200
    return jsonify({'error': 'Product or image not found'}), 404

@app.route('/api/verify-admin', methods=['POST'])
def verify_admin():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    password = data.get('password')
    admin_password = os.getenv('ADMIN_PASSWORD', 'default_admin_password_123')
    if password == admin_password:
        session['is_admin'] = True
        return jsonify({
            'success': True,
            'message': 'Access allowed'
        }), 200
    return jsonify({
        'success': False,
        'message': 'Incorrect password'
    }), 403

@app.route('/api/check-admin', methods=['GET'])
def check_admin():
    if is_admin():
        return jsonify({'isAdmin': True}), 200
    return jsonify({'isAdmin': False}), 401

@app.route('/api/shopName/', methods=['GET'])
def get_shop_name():
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return jsonify(data.get('shopName', 'My Shop'))
    except FileNotFoundError:
        return jsonify('My Shop'), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/shopName/<new_name>', methods=['POST'])
def set_shop_name(new_name):
    auth = admin_required()
    if auth:
        return auth
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        data = {}
    data["shopName"] = new_name
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    return jsonify({
        'message': 'Name changed successfully',
        'new_name': new_name
    }), 200

@app.route('/api/orders', methods=['POST'])
def create_order():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    customer_name = data.get('customer_name')
    phone = data.get('phone')
    item_id = data.get('item_id')
    comment = data.get('comment', '')
    if not customer_name:
        return jsonify({'error': 'customer_name is required'}), 400
    if not phone:
        return jsonify({'error': 'phone is required'}), 400
    if not item_id:
        return jsonify({'error': 'item_id is required'}), 400
    order = order_service.create_order(customer_name, phone, item_id, comment)
    if order:
        return jsonify(order.to_json()), 201
    return jsonify({'error': 'Failed to create order'}), 500

@app.route('/api/orders', methods=['GET'])
def get_orders():
    auth = admin_required()
    if auth:
        return auth
    orders = order_service.get_all_orders()
    return jsonify([order.to_json() for order in orders])

@app.route('/api/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    auth = admin_required()
    if auth:
        return auth
    if order_service.delete_order(order_id):
        return jsonify({'message': f'Order {order_id} deleted'}), 200
    return jsonify({'error': 'Order not found'}), 404

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = shop.get_all_categories()
    return jsonify([
        {
            'id': category[0],
            'name': category[1]
        }
        for category in categories
    ])

@app.route('/api/categories', methods=['POST'])
def add_category():
    auth = admin_required()
    if auth:
        return auth
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    name = data.get('name')
    if not name:
        return jsonify({'error': 'Category name is required'}), 400
    try:
        category_id = shop.add_category(name)
    except Exception:
        return jsonify({'error': 'Category already exists'}), 409
    return jsonify({
        'id': category_id,
        'name': name
    }), 201

@app.route('/api/categories/<int:category_id>', methods=['DELETE'])
def delete_category(category_id):
    auth = admin_required()
    if auth:
        return auth
    if shop.delete_category(category_id):
        return jsonify({
            'message': f'Category {category_id} deleted'
        }), 200
    return jsonify({
        'error': 'Category not found or contains products'
    }), 400

@app.route('/api/shopSettings', methods=['GET'])
def get_shop_settings():
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
        return jsonify({
            "shopName": data.get("shopName", "Магазин"),
            "titleColor": data.get("titleColor", "#38342F"),
            "font": data.get("font", "Poppins, sans-serif")
        }), 200
    except FileNotFoundError:
        return jsonify({
            "shopName": "Магазин",
            "titleColor": "#38342F",
            "font": "Poppins, sans-serif"
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/shopSettings', methods=['PUT'])
def set_shop_settings():
    auth = admin_required()
    if auth:
        return auth
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    try:
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                config = json.load(f)
        except FileNotFoundError:
            config = {}
        config["shopName"] = data.get("shopName", config.get("shopName", "Магазин"))
        config["titleColor"] = data.get("titleColor", config.get("titleColor", "#38342F"))
        config["font"] = data.get("font", config.get("font", "Poppins, sans-serif"))
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        return jsonify(config), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/")
def serve_frontend():
    return send_from_directory(FRONTEND_DIR, "index.html")

@app.route("/<path:path>")
def serve_react(path):
    file_path = os.path.join(FRONTEND_DIR, path)
    if os.path.isfile(file_path):
        return send_from_directory(FRONTEND_DIR, path)
    return send_from_directory(FRONTEND_DIR, "index.html")

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )