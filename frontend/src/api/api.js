export const addItemAPI = (formData) => {
    const formDataToSend = new FormData();
    formDataToSend.append('itemTitle', formData.itemTitle);
    formDataToSend.append('itemPrice', formData.itemPrice);
    formDataToSend.append('itemDescription', formData.itemDescription);
    formData.itemImages.forEach((file) => {
        formDataToSend.append('itemImages', file);
    });

    return fetch('/api/products', {
        method: "POST",
        body: formDataToSend
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка при добавлении");
            }
            return response.json();
        });
};

export const getAllItems = () => {
    return fetch('/api/products', {
        method: "GET",
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Ошибка загрузки товаров")
        }
        return response.json();
    })
}

export const deleteItem = (id) => {
    return fetch(`/api/products/${id}`, {
        method: "DELETE",
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка при удалении товара");
            }
            return response.json();
        });
};

export const verifyAdmin = (password) => {
    return fetch(`/api/verify-admin`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        });
};