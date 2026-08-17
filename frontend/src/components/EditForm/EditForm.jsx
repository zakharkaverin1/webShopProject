import {useState} from "react";
import {editItem} from "../../api/api.js";
import EditImageForm from "../EditImageForm/EditImageForm.jsx";
import styles from "../EditForm/EditForm.module.scss";
import Button from "../Button/Button.jsx";

const EditForm = (props) => {
    const {id, title, description, price, onClose, updateItems} = props;

    const [formData, setFormData] = useState({
        title: title || "",
        description: description || "",
        price: price || "",
    });

    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData((prev) => ({...prev, [name]: value}));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if ((Number.isNaN(Number(formData.price.trim())))) {
            alert("Цена должна быть числом");
            return;
        }

        const dataToSend = {};
        dataToSend.title = formData.title.trim();

        dataToSend.price = formData.price.trim() || price;
        dataToSend.description = formData.description.trim();

        editItem(id, dataToSend)
            .then(() => {
                alert("Товар обновлён");
                onClose();
                updateItems();
            })
            .catch((error) => {
                alert(`Ошибка при обновлении: ${error.message}`);
            });
    };

    return (
        <form onSubmit={handleSubmit} className={styles.editItemForm}>
            <h3>Редактировать товар</h3>
            <div className={styles.editInputs}>
                <label>
                    Название
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    Описание
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                    />
                </label>

                <label>
                    Цена
                    <input
                        type="text"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                    />
                </label>

            </div>
            <p>Изменения картинок сохраняются автоматически</p>
            <EditImageForm className={styles.editImageForm} id={id}></EditImageForm>
            <div>
                <Button type="submit">
                    Сохранить
                </Button>
                <Button type="button" onClick={onClose}>
                    Отмена
                </Button>
            </div>
        </form>
    );
};

export default EditForm;