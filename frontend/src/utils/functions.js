export const filterItemsByTitle = (items, searchQuery) => {
    const query = (searchQuery || '').trim().toLowerCase();
    if (!query) {
        return items;
    }
    return items.filter(item =>
        (item.title || '').toLowerCase().includes(query)
    );
}

export const formatPrice = (price) => {
    const value = Number(price);
    if (!Number.isFinite(value)) return `${price} ₽`;
    return `${value.toLocaleString('ru-RU', {maximumFractionDigits: 2})} ₽`;
}

export const formatDate = (dateStr) => {
    if (!dateStr) return "Нет даты";
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return dateStr;
    return date.toLocaleString("ru-RU", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

export const PRODUCT_STATUSES = {
    available: "В наличии",
    made_to_order: "Под заказ",
    sold: "Продано",
};

export const getStatusLabel = (status) => PRODUCT_STATUSES[status] || PRODUCT_STATUSES.available;

export const SORT_OPTIONS = {
    new: "Сначала новые",
    price_asc: "Сначала дешевле",
    price_desc: "Сначала дороже",
};

export const sortItems = (items, sort) => {
    const sorted = [...items];
    if (sort === "price_asc") sorted.sort((a, b) => Number(a.price) - Number(b.price));
    if (sort === "price_desc") sorted.sort((a, b) => Number(b.price) - Number(a.price));
    // проданные товары показываем в конце, чтобы не мешали выбору
    return sorted.sort((a, b) => (a.status === "sold") - (b.status === "sold"));
}

// [ОПТ] общая проверка и подготовка формы товара для AddForm и EditForm (раньше код был в обеих формах)
export const EMPTY_PRODUCT = {  // [ОПТ]
    title: '', description: '', price: '', category_id: '',  // [ОПТ]
    materials: '', dimensions: '', status: 'available',  // [ОПТ]
};  // [ОПТ]

// возвращает текст ошибки или null  // [ОПТ]
export const productFormError = (values, {requireDescription = false} = {}) => {  // [ОПТ]
    // price может прийти с сервера числом, поэтому приводим к строке  // [ОПТ]
    const price = String(values.price).trim().replace(',', '.');  // [ОПТ]
    if (!values.title.trim()) return "Название не может быть пустым";  // [ОПТ]
    if (requireDescription && !values.description.trim()) return "Заполните описание";  // [ОПТ]
    if (!price || !Number.isFinite(Number(price)) || Number(price) < 0) return "Цена должна быть неотрицательным числом";  // [ОПТ]
    if (!values.category_id) return "Выберите категорию";  // [ОПТ]
    return null;  // [ОПТ]
};  // [ОПТ]

export const productPayload = (values) => ({  // [ОПТ]
    title: values.title.trim(),  // [ОПТ]
    description: values.description.trim(),  // [ОПТ]
    price: Number(String(values.price).trim().replace(',', '.')),  // [ОПТ]
    category_id: Number(values.category_id),  // [ОПТ]
    materials: values.materials.trim(),  // [ОПТ]
    dimensions: values.dimensions.trim(),  // [ОПТ]
    status: values.status,  // [ОПТ]
});  // [ОПТ]
