import styles from './DeleteForm.module.scss';
import {deleteItem} from "../../api/api.js";
import Button from "../Button/Button.jsx";

const DeleteForm = (props) => {
    const {id, title, onClose, updateItems} = props;
    const handleDelete = (productId, productTitle) => {

        if (confirm(`Удалить "${productTitle}"?`)) {
            deleteItem(productId)
                .then(() => {
                    alert("Товар удален");
                    onClose();
                    updateItems();
                })
                .catch((error) => {
                    alert(`Ошибка при удалении: ${error.message}`);
                });
        }
    };
    return (
        <div className={styles.form}>
            <p>Вы хотите удалить товар {props.title}?</p>
            <Button
                className={styles.deleteButton}
                onClick={() => handleDelete(id, title)}>Удалить {props.title}</Button>
        </div>
    );
};

export default DeleteForm;