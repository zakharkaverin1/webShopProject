import React, {useState} from 'react';
import AddInput from "../AddInput/AddInput.jsx";
import Button from "../Button/Button.jsx";
import AddImage from "../AddImage/AddImage.jsx";

const AddForm = () => {
    const [formData, setFormData] = useState({
        itemTitle: '',
        itemPrice: '',
        itemDescription: '',
        itemImages: []
    });

    const submitItem = () =>    {
        if (!formData.itemTitle || !formData.itemPrice || !formData.itemDescription || !formData.itemImages.length) {
            console.log("Заполните все поля!");
            return;
        }

        const formDataToSend = new FormData();
        formDataToSend.append('itemTitle', formData.itemTitle);
        formDataToSend.append('itemPrice', formData.itemPrice);
        formDataToSend.append('itemDescription', formData.itemDescription);
        formData.itemImages.forEach((file) => {
            formDataToSend.append('itemImages', file);
        });

        fetch('http://localhost:8000/api/products', {
            method: "POST",
            body: formDataToSend
        })
        .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Ошибка при добавлении");
                }
            })
        .then(result => {
                console.log("Товар добавлен", result);
                setFormData({
                    itemTitle: '',
                    itemPrice: '',
                    itemDescription: '',
                    itemImages: []
                });
                alert("Товар успешно добавлен");
            })
            .catch(error => {
                console.error("Ошибка:", error);
                alert("Не получилось добавит ттовар");
            });
    }

   const updateFormData = (fieldName, value) => {
       setFormData({
           ...formData,
           [fieldName]: value
       });
   }
    return (
        <div>
            <h1>Добавить новый товар</h1>
            <AddImage
                name="itemImages"
                onChange={(value) =>{
                    updateFormData('itemImages', value)
                }}
            />
            <AddInput
                placeholder="Введите название товара"
                value={formData.itemTitle}
                name="itemTitle"
                type='text'
                onChange={(value) => {
                    updateFormData('itemTitle', value)
                }}
            />
            <AddInput
                placeholder="Введите ценник в рублях"
                value={formData.itemPrice}
                name="itemPrice"
                type='number'
                onChange={(value) => {
                    updateFormData('itemPrice', value)
                }}
            />
            <AddInput
                placeholder="Введите описание товара"
                value={formData.itemDescription}
                name="itemDescription"
                type='textarea'
                onChange={(value) => {
                    updateFormData('itemDescription', value)
                }}
            />
            <Button onClick={submitItem}>
                Добавить товар
            </Button>
        </div>
    );
}

export default AddForm;