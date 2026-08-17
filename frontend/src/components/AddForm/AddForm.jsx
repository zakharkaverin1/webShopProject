import React, { useState } from 'react';
import styles from './AddForm.module.scss';
import AddInput from "../AddInput/AddInput.jsx";
import Button from "../Button/Button.jsx";
import AddImage from "../AddImage/AddImage.jsx";
import { addItemAPI } from "../../api/api.js";

const AddForm = (props) => {
    const {updateItems} = props;
    const [formData, setFormData] = useState({
        itemTitle: '',
        itemPrice: '',
        itemDescription: '',
        itemImages: []
    });
    const [imageKey, setImageKey] = useState(0);


    const submitItem = () => {
        if (!formData.itemTitle || !formData.itemPrice || !formData.itemDescription || !formData.itemImages.length) {
            alert("Заполните все поля!");
            return;
        }

        addItemAPI(formData)
            .then(result => {
                console.log("Товар добавлен", result);
                setFormData({
                    itemTitle: '',
                    itemPrice: '',
                    itemDescription: '',
                    itemImages: []
                });
                alert("Товар успешно добавлен");
                setImageKey(prev => prev+1)
                updateItems();
            })
            .catch(error => {
                console.error("Ошибка:", error);
                alert("Не получилось добавить товар");
            });
    }

    const updateFormData = (fieldName, value) => {
        setFormData({
            ...formData,
            [fieldName]: value
        });
    }

    return (
        <div className={styles.form}>
            <h1>Добавить товар</h1>

            <div className={styles.imageSection}>
                <AddImage
                    name="itemImages"
                    onChange={(value) => updateFormData('itemImages', value)}
                    key={imageKey}
                    resetKey={imageKey}
                />
            </div>

            <div className={styles.fieldGroup}>
                <AddInput
                    placeholder="Название товара"
                    value={formData.itemTitle}
                    name="itemTitle"
                    type='text'
                    onChange={(value) => updateFormData('itemTitle', value)}
                />
            </div>

            <div className={styles.fieldGroup}>
                <AddInput
                    placeholder="Цена в ₽"
                    value={formData.itemPrice}
                    name="itemPrice"
                    type='number'
                    onChange={(value) => updateFormData('itemPrice', value)}
                />
            </div>
            <div className={styles.fieldGroup}>
                <AddInput
                    className={styles.textarea}
                    placeholder="Описание товара"
                    value={formData.itemDescription}
                    name="itemDescription"
                    type='textarea'
                    onChange={(value) => updateFormData('itemDescription', value)}
                />
            </div>

            <Button className={styles.addButton} onClick={submitItem} >
                Добавить
            </Button>
        </div>
    );
}

export default AddForm;