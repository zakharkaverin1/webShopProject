export const addItemAPI = (formData) => {
    const formDataToSend = new FormData();
    formDataToSend.append('itemTitle', formData.itemTitle);
    formDataToSend.append('itemPrice', formData.itemPrice);
    formDataToSend.append('itemDescription', formData.itemDescription);
    formData.itemImages.forEach((file) => {
        formDataToSend.append('itemImages', file);
    });

    return fetch('http://localhost:8000/api/products', {
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
    return fetch('http://localhost:8000/api/products', {
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
    return fetch(`http://localhost:8000/api/products/${id}`, {
        method: "DELETE",
    })
        .then(response => {
            if (!response.ok) {
                throw new Error("Ошибка при удалении товара");
            }
            return response.json();
        });
};