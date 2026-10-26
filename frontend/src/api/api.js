import {apiFetch} from "./apiUtils.js";

export const addItemAPI = (fields, images = []) => { // [ОПТ]
    const body = new FormData();
    Object.entries(fields).forEach(([name, value]) => body.append(name, value)); // [ОПТ]
    images.forEach((file) => body.append('itemImages', file)); // [ОПТ]
    return apiFetch('/api/products', {
        method: 'POST',
        body,
    });
};

export const getAllItems = () => apiFetch('/api/products'); // [ОПТ]

export const getItem = (id) => apiFetch(`/api/products/${id}`); // [ОПТ]

export const editItem = (id, fields) => apiFetch(`/api/products/${id}`, {method: 'PUT', body: fields}); // [ОПТ]

export const deleteItem = (id) => {
    return apiFetch(`/api/products/${id}`, {
        method: 'DELETE',
    });
};


export const checkAdmin = async () => {
    try {
        const data = await apiFetch('/api/check-admin'); // [ОПТ] [БЕЗОП] ответ содержит CSRF-токен, его запоминает apiFetch
        return Boolean(data?.isAdmin);
    } catch {
        return false;
    }
};

export const verifyAdmin = (password) => {
    return apiFetch('/api/verify-admin', {
        method: 'POST',
        body: { password },
    });
};

export const uploadImages = (productId, files) => {
    const body = new FormData();
    // files может быть FileList, у которого нет forEach
    Array.from(files).forEach((file) => {
        body.append('itemImages', file);
    });
    return apiFetch(`/api/products/${productId}/images`, {
        method: 'POST',
        body,
    });
};

export const replaceItemImage = (productId, file, imageIndex = 0) => {
    const formData = new FormData();
    formData.append('itemImage', file);

    return apiFetch(
        `/api/products/${productId}/image/${imageIndex}`,
        {
            method: 'PUT',
            body: formData,
        }
    )
};

export const deleteItemImage = (productId, imageIndex) => apiFetch(
    `/api/products/${productId}/image/${imageIndex}`, {method: 'DELETE'}
);

export const createOrderAPI = (orderData) => {
    return apiFetch('/api/orders', {
        method: 'POST',
        body: orderData,
    });
};

export const getAllOrders = () => apiFetch('/api/orders'); // [ОПТ]

export const deleteOrder = (orderId) => {
    return apiFetch(`/api/orders/${orderId}`, {
        method: "DELETE",
    })
};

export const getCategories = () => apiFetch('/api/categories'); // [ОПТ]

export const addCategory = (name) => {
    return apiFetch('/api/categories', {
        method: 'POST',
        body: { name },
    });
};

export const deleteCategory = (categoryId) => {
    return apiFetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
    });
};

export const getShopSettings = () => apiFetch('/api/shopSettings'); // [ОПТ]

export const setShopSettings = (settings) => {
    return apiFetch('/api/shopSettings', {
        method: 'PUT',
        body: {
            shopName: settings.shopName,
            titleColor: settings.titleColor,
            font: settings.font,
        },
    });
};

export const logoutAdmin = () => {
    return apiFetch('/api/logout', {
        method: 'POST',
    })
};