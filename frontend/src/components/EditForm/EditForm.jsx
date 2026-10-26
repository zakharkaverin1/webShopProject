import { useState } from "react";
import { editItem } from "../../api/api.js";
import EditImageForm from "../EditImageForm/EditImageForm.jsx";
import styles from "./EditForm.module.scss";
import Button from "../Button/Button.jsx";
import ProductFields from "../ProductFields/ProductFields.jsx";
import { productFormError, productPayload } from "../../utils/functions.js";

const EditForm = (props) => {
    const {item, categories = [], onClose} = props;
    const {id} = item;

    const [formData, setFormData] = useState({
        title: item.title || "",
        description: item.description || "",
        price: item.price ?? "",
        category_id: item.category_id ?? "",
        materials: item.materials || "",
        dimensions: item.dimensions || "",
        status: item.status || "available",
    });
    const [isSaving, setIsSaving] = useState(false);

    const updateField = (name, value) => {
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isSaving) return;

        const error = productFormError(formData);
        if (error) {
            alert(error);
            return;
        }

        setIsSaving(true);
        editItem(id, productPayload(formData))
            .then(() => onClose())
            .catch((error) => {
                alert(`Ошибка при обновлении: ${error.message}`);
                setIsSaving(false);
            });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.editItemForm}>
            <h3>Редактировать товар</h3>

            <div className={styles.editInputs}>
                <ProductFields values={formData} onChange={updateField} categories={categories}/>
            </div>

            <div className={styles.imagesHeader}>
                <span>Фотографии</span>
                <span className={styles.hint}>сохраняются автоматически</span>
            </div>

            <EditImageForm id={id}/>

            <div className={styles.actions}>
                <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
                    Отмена
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </div>
        </form>
    );
};

export default EditForm;
