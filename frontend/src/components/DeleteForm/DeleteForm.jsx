import {useState} from "react";
import styles from './DeleteForm.module.scss';
import {deleteItem} from "../../api/api.js";
import Button from "../Button/Button.jsx";

const DeleteForm = (props) => {
    const {id, title, onClose, updateItems} = props;
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        setIsDeleting(true);
        deleteItem(id)
            .then(() => {
                onClose();
                updateItems();
            })
            .catch((error) => {
                alert(`Ошибка при удалении: ${error.message}`);
                setIsDeleting(false);
            });
    };

    return (
        <div className={styles.form}>
            <h3>Удалить товар?</h3>
            <p className={styles.text}>
                Товар «{title}» и все его фотографии будут удалены без возможности восстановления.
            </p>
            <div className={styles.actions}>
                <Button variant="secondary" onClick={onClose} disabled={isDeleting}>
                    Отмена
                </Button>
                <Button variant="danger" onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? 'Удаление...' : 'Удалить'}
                </Button>
            </div>
        </div>
    );
};

export default DeleteForm;
