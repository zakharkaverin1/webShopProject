import {apiFetch} from "./apiUtils.js";

export const addItemAPI = (formData) => {
    const body = new FormData();
    body.append('itemTitle', formData.itemTitle);
    body.append('itemPrice', formData.itemPrice);
    body.append('itemDescription', formData.itemDescription);
    body.append('category_id', formData.category_id);
    formData.itemImages.forEach((file) => {
        body.append('itemImages', file);
    });
    return apiFetch('/api/products', {
        method: 'POST',
        body,
    });
};

export const getAllItems = () => {
    return apiFetch('/api/products', {
        method: 'GET',
    });
};

export const editItem = (id, { title, price, description, category_id }) => {
    return apiFetch(`/api/products/${id}`, {
        method: 'PUT',
        body: {
            title,
            price,
            description,
            category_id,
        },
    });
};

export const deleteItem = (id) => {
    return apiFetch(`/api/products/${id}`, {
        method: 'DELETE',
    });
};


export const checkAdmin = async () => {
    try {
        return await apiFetch('/api/check-admin', {method: 'GET'});
    } catch {
        return undefined;
    }
};

export const uploadImages = (productId, files) => {
    const body = new FormData();
    files.forEach((file) => {
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

export const deleteItemImage = (productId, imageIndex) => {
    const index = Number(imageIndex);
    return apiFetch(
        `/api/products/${productId}/image/${index}`,
        {
            method: 'DELETE',
        }
    )
};

export const createOrderAPI = (orderData) => {
    return apiFetch('/api/orders', {
        method: 'POST',
        body: orderData,
    });
};

export const getAllOrders = () => {
    return apiFetch('/api/orders', {
        method: "GET",
    })
};

export const deleteOrder = (orderId) => {
    return apiFetch(`/api/orders/${orderId}`, {
        method: "DELETE",
    })
};

export const getCategories = () => {
    return apiFetch('/api/categories', {
        method: 'GET',
    });
};

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

export const getShopSettings = () => {
    return apiFetch('/api/shopSettings', {
        method: 'GET',
    })
};

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