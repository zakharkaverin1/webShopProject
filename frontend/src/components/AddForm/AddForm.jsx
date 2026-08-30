import React, { useEffect, useState } from 'react';
import styles from './AddForm.module.scss';
import AddInput from "../AddInput/AddInput.jsx";
import Button from "../Button/Button.jsx";
import AddImage from "../AddImage/AddImage.jsx";
import { addItemAPI, getCategories } from "../../api/api.js";

const AddForm = (props) => {
    const { updateItems } = props;

    const [formData, setFormData] = useState({
        itemTitle: '',
        itemPrice: '',
        itemDescription: '',
        itemImages: [],
        category_id: ''
    });

    const [categories, setCategories] = useState([]);
    const [imageKey, setImageKey] = useState(0);

    useEffect(() => {
        getCategories()
            .then(result => {
                setCategories(result);
            })
            .catch(error => {
                console.error("ошибкап загрузки категорий:", error);
            });
    }, []);

    const submitItem = () => {
        if (
            !formData.itemTitle ||
            !formData.itemPrice ||
            !formData.itemDescription ||
            !formData.itemImages.length ||
            !formData.category_id
        ) {
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
                    itemImages: [],
                    category_id: ''
                });

                alert("Товар успешно добавлен");

                setImageKey(prev => prev + 1);
                updateItems();
            })
            .catch(error => {
                console.error("Ошибка:", error);
                alert("Не получилось добавить товар");
            });
    };

    const updateFormData = (fieldName, value) => {
        setFormData({
            ...formData,
            [fieldName]: value
        });
    };

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
            <div className={styles.fieldGroup}>
                <select
                    value={formData.category_id}
                    onChange={(event) =>
                        updateFormData(
                            'category_id',
                            event.target.value
                        )
                    }
                >
                    <option value="">Выберите категорию</option>
                    {categories.map(category => (
                        <option
                            key={category.id}
                            value={category.id}
                        >
                            {category.name}
                        </option>
                    ))}
                </select>
            </div>

            <Button
                className={styles.addButton}
                onClick={submitItem}
            >
                Добавить
            </Button>
        </div>
    );
};

export default AddForm;