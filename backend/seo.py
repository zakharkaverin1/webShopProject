"""SEO: метатеги, JSON-LD, robots.txt и sitemap.xml.

Фронтенд — одностраничное приложение, поэтому без этого модуля поисковики
и соцсети видят на любой странице один и тот же пустой index.html.
Здесь сервер подставляет в index.html заголовок, описание и разметку
конкретной страницы до того, как её получит браузер или поисковый робот.

Заголовки, описания и адреса товаров повторяет фронтенд (frontend/src/utils/seo.js),
чтобы при переходах внутри сайта получался тот же результат. Меняете здесь — меняйте и там.
"""
import html
import json
import os
import re
from urllib.parse import urlsplit
from xml.sax.saxutils import escape as xml_escape

SITE_URL = (os.getenv("SITE_URL") or "").rstrip("/")
GOOGLE_SITE_VERIFICATION = os.getenv("GOOGLE_SITE_VERIFICATION", "")
YANDEX_VERIFICATION = os.getenv("YANDEX_VERIFICATION", "")
# номер счётчика Яндекс.Метрики; без него счётчик не подключается
YANDEX_METRIKA_ID = (os.getenv("YANDEX_METRIKA_ID") or "").strip()
if not YANDEX_METRIKA_ID.isdigit():
    YANDEX_METRIKA_ID = ""

DESCRIPTION_LIMIT = 160
TITLE_LIMIT = 70
SLUG_LIMIT = 60

# Транслитерация для адресов как в загранпаспортах (ГОСТ Р 52535.1-2006 / ICAO),
# её же понимает Яндекс: только латиница, цифры и дефисы.
TRANSLIT = {
    "а": "a", "б": "b", "в": "v", "г": "g", "д": "d", "е": "e", "ё": "e", "ж": "zh",
    "з": "z", "и": "i", "й": "i", "к": "k", "л": "l", "м": "m", "н": "n", "о": "o",
    "п": "p", "р": "r", "с": "s", "т": "t", "у": "u", "ф": "f", "х": "kh", "ц": "ts",
    "ч": "ch", "ш": "sh", "щ": "shch", "ъ": "", "ы": "y", "ь": "", "э": "e", "ю": "iu",
    "я": "ia",
}

# schema.org-статусы наличия для наших статусов товара
AVAILABILITY = {
    "available": "https://schema.org/InStock",
    "made_to_order": "https://schema.org/MadeToOrder",
    "sold": "https://schema.org/SoldOut",
}

# наличие словами для description
STATUS_TEXT = {
    "available": "в наличии",
    "made_to_order": "изготовим на заказ",
    "sold": "продано, можно заказать похожее",
}

# служебные параметры, которые не меняют содержимое страницы (директива Яндекса Clean-param)
CLEAN_PARAMS = (
    "utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content",
    "yclid", "ysclid", "gclid", "fbclid", "from", "_openstat",
)

_TITLE_RE = re.compile(r"<title>.*?</title>\s*", re.S | re.I)
_DESCRIPTION_RE = re.compile(r'<meta\s+name="description"[^>]*>\s*', re.I)
_BODY_RE = re.compile(r"(<body[^>]*>)", re.I)


def base_url(request):
    """Адрес сайта: из SITE_URL или из текущего запроса."""
    return SITE_URL or request.url_root.rstrip("/")


def mirror_redirect(request):
    """Адрес главного зеркала для запроса на http:// или www-версию SITE_URL, иначе None.

    Другие хосты (localhost, адрес хостинга) не трогаем, чтобы не мешать разработке.
    """
    if not SITE_URL or request.method not in ("GET", "HEAD"):
        return None
    site = urlsplit(SITE_URL)
    site_host = site.netloc.lower()
    bare_host = site_host[4:] if site_host.startswith("www.") else site_host
    host = request.host.lower()
    if host not in (bare_host, f"www.{bare_host}"):
        return None
    if host == site_host and request.scheme == site.scheme:
        return None
    query = request.query_string.decode("latin-1")
    return f"{SITE_URL}{request.path}{'?' + query if query else ''}"


def absolute(base, path):
    if not path:
        return None
    if path.startswith(("http://", "https://")):
        return path
    return f"{base}{path if path.startswith('/') else '/' + path}"


def slugify(text):
    """Название товара -> "zerkalo-v-rame-iz-rotanga" (до SLUG_LIMIT символов, по границе слова)."""
    result = "".join(TRANSLIT.get(ch, ch) for ch in (text or "").lower())
    words = re.findall(r"[a-z0-9]+", result)
    slug = ""
    for word in words:
        candidate = f"{slug}-{word}" if slug else word
        if len(candidate) > SLUG_LIMIT:
            break
        slug = candidate
    # если первое слово само длиннее лимита — обрезаем его
    return slug or (words[0][:SLUG_LIMIT] if words else "")


def item_path(product_id, title):
    """Канонический путь товара: /item/12-zerkalo-v-rame. Источник истины — id, slug — для людей и поиска."""
    slug = slugify(title)
    return f"/item/{product_id}-{slug}" if slug else f"/item/{product_id}"


def format_price(price):
    """12500 -> "12 500", 12500.5 -> "12 500,50"."""
    whole, frac = f"{float(price):.2f}".split(".")
    sign = "-" if whole.startswith("-") else ""
    whole = whole.lstrip("-")
    groups = []
    while whole:
        groups.insert(0, whole[-3:])
        whole = whole[:-3]
    text = sign + " ".join(groups or ["0"])
    return text if frac == "00" else f"{text},{frac}"


def shorten(text, limit=DESCRIPTION_LIMIT):
    text = " ".join((text or "").split())
    if len(text) <= limit:
        return text
    return text[:limit - 1].rsplit(" ", 1)[0] + "…"


def _sentence(text):
    return text if not text or text[-1] in ".!?…" else text + "."


def _lower_first(text):
    return text[:1].lower() + text[1:]


def product_title(title, category_name, shop_name):
    """«Название — категория, ручная работа | Магазин», если влезает в TITLE_LIMIT."""
    if category_name:
        full = f"{title} — {_lower_first(category_name)}, ручная работа | {shop_name}"
        if len(full) <= TITLE_LIMIT:
            return full
    short = f"{title} — ручная работа | {shop_name}"
    if len(short) <= TITLE_LIMIT:
        return short
    return f"{title} | {shop_name}"


def product_description(product, category_name=None):
    """120–160 символов: описание товара (или текст из названия и категории) + цена и наличие."""
    status = product.status if product.status in STATUS_TEXT else "available"
    offer = f"Цена {format_price(product.price)} ₽, {STATUS_TEXT[status]}."
    if product.description:
        lead = product.description
    else:
        lead = f"{product.title} ручной работы"
        if category_name:
            lead += f", раздел «{category_name}»"
    lead = _sentence(shorten(lead, DESCRIPTION_LIMIT - len(offer) - 1))
    extras = []
    if product.materials:
        extras.append(_sentence(f"Материалы: {product.materials}"))
    if product.dimensions:
        extras.append(_sentence(f"Размеры: {product.dimensions}"))
    # общие фразы добирают короткое описание до 120+ символов, если влезают
    extras += ["Доставка по России.", "Каждое изделие сделано вручную.", "Ответим на вопросы и поможем с выбором."]

    text = f"{lead} {offer}"
    for extra in extras:
        if len(text) + 1 + len(extra) <= DESCRIPTION_LIMIT:
            text += f" {extra}"
    return " ".join(text.split())


def _json_ld(data):
    # "</" внутри JSON может закрыть тег <script>, поэтому экранируем
    return json.dumps(data, ensure_ascii=False).replace("</", "<\\/")


def _metrika_script(counter_id):
    # стандартный код счётчика; переходы внутри SPA отправляет фронтенд через ym(..., 'hit')
    return (
        "<script>"
        "(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};"
        "m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return;}}"
        "k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})"
        "(window,document,'script','https://mc.yandex.ru/metrika/tag.js','ym');"
        f"window.YANDEX_METRIKA_ID={counter_id};"
        f"ym({counter_id},'init',{{clickmap:true,trackLinks:true,accurateTrackBounce:true}});"
        "</script>"
    )


def render_page(index_html, *, title, description, url, site_name,
                image=None, og_type="website", json_ld=None, noindex=False):
    """Возвращает index.html с метатегами конкретной страницы."""
    e = lambda value: html.escape(value or "", quote=True)
    tags = [
        f"<title>{e(title)}</title>",
        f'<meta name="description" content="{e(description)}" />',
        f'<meta name="robots" content="{"noindex, nofollow" if noindex else "index, follow"}" />',
    ]
    # у служебных страниц и страниц ошибок canonical не нужен
    if not noindex:
        tags.append(f'<link rel="canonical" href="{e(url)}" />')
    tags += [
        f'<meta property="og:type" content="{e(og_type)}" />',
        f'<meta property="og:site_name" content="{e(site_name)}" />',
        '<meta property="og:locale" content="ru_RU" />',
        f'<meta property="og:title" content="{e(title)}" />',
        f'<meta property="og:description" content="{e(description)}" />',
        f'<meta property="og:url" content="{e(url)}" />',
        f'<meta name="twitter:card" content="{"summary_large_image" if image else "summary"}" />',
    ]
    if image:
        tags.append(f'<meta property="og:image" content="{e(image)}" />')
    if GOOGLE_SITE_VERIFICATION:
        tags.append(f'<meta name="google-site-verification" content="{e(GOOGLE_SITE_VERIFICATION)}" />')
    if YANDEX_VERIFICATION:
        tags.append(f'<meta name="yandex-verification" content="{e(YANDEX_VERIFICATION)}" />')
    for item in json_ld or []:
        tags.append(f'<script type="application/ld+json">{_json_ld(item)}</script>')
    if YANDEX_METRIKA_ID:
        tags.append(_metrika_script(YANDEX_METRIKA_ID))

    page = _TITLE_RE.sub("", index_html, count=1)
    page = _DESCRIPTION_RE.sub("", page, count=1)
    block = "\n    ".join(tags)
    page = page.replace("</head>", f"    {block}\n  </head>", 1)
    if YANDEX_METRIKA_ID:
        noscript = (
            f'<noscript><div><img src="https://mc.yandex.ru/watch/{YANDEX_METRIKA_ID}" '
            'style="position:absolute; left:-9999px;" alt="" /></div></noscript>'
        )
        page = _BODY_RE.sub(lambda m: f"{m.group(1)}\n    {noscript}", page, count=1)
    return page


def home_meta(base, settings):
    name = settings["shopName"]
    # тот же текст использует фронтенд (utils/seo.js, homeMeta)
    description = (
        f"{name} — зеркала, вазы, панно и другой декор ручной работы. "
        "Изделия в единственном экземпляре и на заказ, доставка по России."
    )
    return {
        "title": f"{name} — декор ручной работы: зеркала, вазы, панно",
        "description": shorten(description),
        "url": f"{base}/",
        "site_name": name,
        "json_ld": [
            {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": name,
                "url": f"{base}/",
                "inLanguage": "ru",
            },
            {
                "@context": "https://schema.org",
                "@type": "Store",
                "name": name,
                "url": f"{base}/",
                "description": description,
                "currenciesAccepted": "RUB",
            },
        ],
    }


def product_meta(base, settings, product, category_name=None):
    name = settings["shopName"]
    url = f"{base}{item_path(product.id, product.title)}"
    images = [absolute(base, path) for path in product.images if path]
    status = product.status if product.status in AVAILABILITY else "available"
    description = product_description(product, category_name)

    product_ld = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.title,
        "description": product.description or description,
        "sku": str(product.id),
        "url": url,
        "brand": {"@type": "Brand", "name": name},
        "offers": {
            "@type": "Offer",
            "url": url,
            "price": f"{float(product.price):.2f}",
            "priceCurrency": "RUB",
            "availability": AVAILABILITY[status],
            "itemCondition": "https://schema.org/NewCondition",
        },
    }
    if images:
        product_ld["image"] = images
    if product.materials:
        product_ld["material"] = product.materials
    if category_name:
        product_ld["category"] = category_name

    # у категорий нет своих страниц: ведём на главную с выбранным фильтром
    breadcrumbs = [{"@type": "ListItem", "position": 1, "name": "Главная", "item": f"{base}/"}]
    if category_name and product.category_id:
        breadcrumbs.append({
            "@type": "ListItem",
            "position": 2,
            "name": category_name,
            "item": f"{base}/?category={product.category_id}",
        })
    breadcrumbs.append({"@type": "ListItem", "position": len(breadcrumbs) + 1, "name": product.title, "item": url})

    return {
        "title": product_title(product.title, category_name, name),
        "description": description,
        "url": url,
        "site_name": name,
        "image": images[0] if images else None,
        "og_type": "product",
        "json_ld": [
            product_ld,
            {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": breadcrumbs},
        ],
    }


def robots_txt(base):
    return "\n".join([
        "User-agent: *",
        "Disallow: /adm",
        "Disallow: /api/",
        # Clean-param понимает только Яндекс, остальные роботы строку пропускают
        f"Clean-param: {'&'.join(CLEAN_PARAMS)}",
        "",
        f"Sitemap: {base}/sitemap.xml",
        "",
    ])


def sitemap_xml(base, products):
    urls = [(f"{base}/", "daily", "1.0")]
    urls += [
        (f"{base}{item_path(product.id, product.title)}", "weekly", "0.5" if product.status == "sold" else "0.8")
        for product in products
    ]
    entries = "\n".join(
        f"  <url><loc>{xml_escape(loc)}</loc><changefreq>{freq}</changefreq><priority>{priority}</priority></url>"
        for loc, freq, priority in urls
    )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{entries}\n"
        "</urlset>\n"
    )
