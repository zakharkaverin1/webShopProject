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

        console.log("Товар для отправки:", formData);

        setFormData({
            itemTitle: '',
            itemPrice: '',
            itemDescription: '',
            itemImages: []
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