import React, { useState } from 'react';
import styles from './AddForm.module.scss';
import Button from "../Button/Button.jsx";
import ProductFields from "../ProductFields/ProductFields.jsx";
import { addItemAPI } from "../../api/api.js";
import { EMPTY_PRODUCT, productFormError, productPayload } from "../../utils/functions.js";


const AddForm = (props) => {
    const { categories = [], updateItems, onClose } = props;

    const [formData, setFormData] = useState(EMPTY_PRODUCT);
    const [images, setImages] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const submitItem = (e) => {
        e.preventDefault();
        if (isSubmitting) return;

        const error = productFormError(formData, {requireDescription: true});
        if (error) {
            alert(error);
            return;
        }

        setIsSubmitting(true);
        addItemAPI(productPayload(formData), images)
            .then(() => {
                updateItems();
                onClose?.();
            })
            .catch(error => {
                console.error("Ошибка:", error);
                alert(`Не получилось добавить товар: ${error.message}`);
            })
            .finally(() => setIsSubmitting(false));
    };

    const updateFormData = (fieldName, value) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    return (
        <form className={styles.form} onSubmit={submitItem}>
            <h2>Добавить товар</h2>

            <div className={styles.imageSection}>
                <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    multiple
                    onChange={(e) => setImages(Array.from(e.target.files))}
                />
                <p className={styles.hint}>
                    {images.length > 0
                        ? `Выбрано фото: ${images.length}. Первое станет обложкой.`
                        : 'Фото можно добавить позже — пока будет показана заглушка.'}
                </p>
            </div>

            <ProductFields values={formData} onChange={updateFormData} categories={categories}/>
            {categories.length === 0 && (
                <span className={styles.hint}>Сначала создайте категорию в меню «Категории»</span>
            )}

            <Button type="submit" className={styles.addButton} disabled={isSubmitting}>
                {isSubmitting ? 'Сохранение...' : 'Добавить'}
            </Button>
        </form>
    );
};

export default AddForm;
