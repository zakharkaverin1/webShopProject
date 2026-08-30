export const addItemAPI = (formData) => {
    const formDataToSend = new FormData();
    formDataToSend.append('itemTitle', formData.itemTitle);
    formDataToSend.append('itemPrice', formData.itemPrice);
    formDataToSend.append('itemDescription', formData.itemDescription);
    formDataToSend.append('category_id', formData.category_id);

    formData.itemImages.forEach((file) => {
        formDataToSend.append('itemImages', file);
    });

    return fetch('/api/products', {
        method: "POST",
        body: formDataToSend,
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Ошибка при добавлении`);
            }
            return response.json();
        });
};

export const getAllItems = () => {
    return fetch('/api/products', {
        method: "GET",
        credentials: 'include',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка загрузки товаров");
            }
            return response.json();
        });
};

export const editItem = (
    id,
    { title, price, description, category_id }
) => {
    return fetch(`/api/products/${id}`, {
        method: "PUT",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            title,
            price,
            description,
            category_id
        }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(
                    `Ошибка при обновлении товара: ${response.status}`
                );
            }
            return response.json();
        });
};

export const deleteItem = (id) => {
    return fetch(`/api/products/${id}`, {
        method: "DELETE",
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка при удалении товара");
            }
            return response.json();
        });
};

export const checkAdmin = () => {
    return fetch('/api/check-admin', {
        method: 'GET',
        credentials: 'include',
    })
        .then(response => {
            if (!response.ok) {
                return;
            }
            return response.json();
        });
};

export const uploadImages = (productId, files) => {
    const formData = new FormData();

    for (let i = 0; i < files.length; i++) {
        formData.append('itemImages', files[i]);
    }

    return fetch(`/api/products/${productId}/images`, {
method: 'POST',
    body: formData,
    credentials: 'include',
})
.then(response => {
    if (!response.ok) {
        return response.json().then(err => {
            throw new Error(
                err.error || 'Ошибка загрузки картинок'
            );
        });
    }
    return response.json();
});
};

export const getShopName = () => {
    return fetch('/api/shopName/', {
        method: "GET",
        credentials: 'include',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка загрузки названия магазина");
            }
            return response.json();
        });
};

export const setShopName = (newName) => {
    return fetch(`/api/shopName/${newName}`, {
        method: "POST",
        credentials: 'include',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(
                    `Ошибка при обновлении названия: ${response.status}`
                );
            }
            return response.json();
        });
};

export const replaceItemImage = (
    productId,
    file,
    imageIndex = 0
) => {
    const formData = new FormData();
    formData.append('itemImage', file);

    return fetch(
        `/api/products/${productId}/image/${imageIndex}`,
        {
            method: 'PUT',
            body: formData,
            credentials: 'include',
        }
    )
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error);
                });
            }
            return response.json();
        });
};

export const deleteItemImage = (productId, imageIndex) => {
    const index = Number(imageIndex);

    return fetch(
        `/api/products/${productId}/image/${index}`,
        {
            method: 'DELETE',
            credentials: 'include',
        }
    )
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error("Ошибка удаления");
                });
            }
            return response.json();
        });
};

export const createOrderAPI = (orderData) => {
    return fetch('/api/orders', {
        method: "POST",
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(
                        err.error || 'Ошибка при создании заказа'
                    );
                });
            }
            return response.json();
        });
};

export const getAllOrders = () => {
    return fetch('/api/orders', {
        method: "GET",
        credentials: 'include',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка загрузки заказов");
            }
            return response.json();
        });
};

export const deleteOrder = (orderId) => {
    return fetch(`/api/orders/${orderId}`, {
        method: "DELETE",
        credentials: 'include'
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка при удалении заказа");
            }
            return response.json();
        });
};

export const getCategories = () => {
    return fetch('/api/categories', {
        method: 'GET',
        credentials: 'include',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка загрузки категорий");
            }
            return response.json();
        });
};

export const addCategory = (name) => {
    return fetch('/api/categories', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(
                        err.error || "Ошибка добавления категории"
                    );
                });
            }
            return response.json();
        });
};

export const deleteCategory = (categoryId) => {
    return fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
        credentials: 'include',
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(
                        err.error || "Ошибка удаления категории"
                    );
                });
            }
            return response.json();
        });
};

export const getShopSettings = () => {
    return fetch('/api/shopSettings', {
        method: 'GET',
        credentials: 'include',
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка загрузки настроек магазина");
            }
            return response.json();
        });
};

export const setShopSettings = (settings) => {
    return fetch('/api/shopSettings', {
        method: 'PUT',
        credentials: 'include',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            shopName: settings.shopName,
            titleColor: settings.titleColor,
            font: settings.font
        }),
    })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(
                        err.error || "Ошибка сохранения настроек магазина"
                    );
                });
            }
            return response.json();
        });
};
