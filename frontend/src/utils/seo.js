// [SEO] весь файл новый: ЧПУ-адреса, заголовки и описания страниц (копия backend/seo.py)
// Адреса, заголовки и описания страниц. Копия логики backend/seo.py:
// сервер подставляет эти теги при первой загрузке, фронтенд — при переходах внутри сайта.
// Меняете здесь — меняйте и там, результат должен совпадать символ в символ.

export const DESCRIPTION_LIMIT = 160;
const TITLE_LIMIT = 70;
const SLUG_LIMIT = 60;

// транслитерация как в загранпаспортах (ГОСТ Р 52535.1-2006 / ICAO)
const TRANSLIT = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'iu',
    'я': 'ia',
};

const STATUS_TEXT = {
    available: 'в наличии',
    made_to_order: 'изготовим на заказ',
    sold: 'продано, можно заказать похожее',
};

// длина в символах, как len() в Python (эмодзи считаются за один символ)
const length = (text) => Array.from(text).length;

export const slugify = (text) => {
    const result = Array.from((text || '').toLowerCase()).map(ch => TRANSLIT[ch] ?? ch).join('');
    const words = result.match(/[a-z0-9]+/g) || [];
    let slug = '';
    for (const word of words) {
        const candidate = slug ? `${slug}-${word}` : word;
        if (candidate.length > SLUG_LIMIT) break;
        slug = candidate;
    }
    return slug || (words[0] || '').slice(0, SLUG_LIMIT);
};

// канонический адрес товара: /item/12-zerkalo-v-rame
export const itemPath = (id, title) => {
    const slug = slugify(title);
    return slug ? `/item/${id}-${slug}` : `/item/${id}`;
};

// "12-zerkalo-v-rame" -> 12; источник истины — id, slug только для красоты
export const parseItemId = (param) => {
    const match = /^(\d{1,9})(?:-.*)?$/s.exec(param || '');
    return match ? Number(match[1]) : NaN;
};

// 12500 -> "12 500", 12500.5 -> "12 500,50"
export const formatPriceText = (price) => {
    const [whole, frac] = Number(price).toFixed(2).split('.');
    const sign = whole.startsWith('-') ? '-' : '';
    const digits = whole.replace('-', '');
    const grouped = digits.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return frac === '00' ? `${sign}${grouped}` : `${sign}${grouped},${frac}`;
};

export const shorten = (text, limit = DESCRIPTION_LIMIT) => {
    const normalized = (text || '').split(/\s+/).filter(Boolean).join(' ');
    const chars = Array.from(normalized);
    if (chars.length <= limit) return normalized;
    const cut = chars.slice(0, limit - 1).join('');
    const space = cut.lastIndexOf(' ');
    return (space >= 0 ? cut.slice(0, space) : cut) + '…';
};

const sentence = (text) => (!text || '.!?…'.includes(text.slice(-1)) ? text : `${text}.`);

const lowerFirst = (text) => {
    const [first = '', ...rest] = Array.from(text);
    return first.toLowerCase() + rest.join('');
};

export const homeMeta = (shopName) => ({
    title: `${shopName} — декор ручной работы: зеркала, вазы, панно`,
    description: shorten(
        `${shopName} — зеркала, вазы, панно и другой декор ручной работы. ` +
        'Изделия в единственном экземпляре и на заказ, доставка по России.'
    ),
});

export const productTitle = (title, categoryName, shopName) => {
    if (categoryName) {
        const full = `${title} — ${lowerFirst(categoryName)}, ручная работа | ${shopName}`;
        if (length(full) <= TITLE_LIMIT) return full;
    }
    const short = `${title} — ручная работа | ${shopName}`;
    if (length(short) <= TITLE_LIMIT) return short;
    return `${title} | ${shopName}`;
};

export const productDescription = (item, categoryName) => {
    const status = STATUS_TEXT[item.status] ? item.status : 'available';
    const offer = `Цена ${formatPriceText(item.price)} ₽, ${STATUS_TEXT[status]}.`;
    let lead = item.description;
    if (!lead) {
        lead = `${item.title} ручной работы`;
        if (categoryName) lead += `, раздел «${categoryName}»`;
    }
    lead = sentence(shorten(lead, DESCRIPTION_LIMIT - length(offer) - 1));
    const extras = [];
    if (item.materials) extras.push(sentence(`Материалы: ${item.materials}`));
    if (item.dimensions) extras.push(sentence(`Размеры: ${item.dimensions}`));
    // общие фразы добирают короткое описание до 120+ символов, если влезают
    extras.push('Доставка по России.', 'Каждое изделие сделано вручную.', 'Ответим на вопросы и поможем с выбором.');

    let text = `${lead} ${offer}`;
    for (const extra of extras) {
        if (length(text) + 1 + length(extra) <= DESCRIPTION_LIMIT) text += ` ${extra}`;
    }
    return text.split(/\s+/).filter(Boolean).join(' ');
};
