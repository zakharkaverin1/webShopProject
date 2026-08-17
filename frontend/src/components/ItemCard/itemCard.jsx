import styles from './itemCard.module.scss'
import {Link} from "react-router-dom";
import {useState} from "react";
import Modal from "../Modal/modal.jsx";
import DeleteForm from "../DeleteForm/DeleteForm.jsx";
import EditForm from "../EditForm/EditForm.jsx";

const ItemCard = (props) => {
    const {
        id,
        title,
        price,
        description,
        image,
        isAdmin,
        updateItems
    } = props;

    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);

    return (
        <div id="itemCard">
            <Link to={`/item/${id}`} >
                <div className={styles.itemCard}>
                    <img src={image} alt={title}/>
                    <div className={styles.overlay}>
                        <h3 >{title}</h3>
                        <p className={styles.price}>{price} ₽</p>
                    </div>
                </div>
            </Link>
            {isAdmin && (
                <div>
                    <button id="editButton" onClick={() => {
                        setEditModal(true);
                    }}>Редактировать
                    </button>
                    <button id="deleteButton" onClick={() => {
                        setDeleteModal(true)
                    }}>Удалить
                    </button>
                </div>
            )}
            <Modal isOpen={editModal}
                   onClose={() => setEditModal(false)}>
                <EditForm id={id} title={title} description={description} price={price}
                          onClose={() => setEditModal(false)} updateItems={updateItems}/>
            </Modal>
            <Modal isOpen={deleteModal}
                   onClose={() => setDeleteModal(false)}>
                <DeleteForm id={id} title={title} onClose={() => setDeleteModal(false)} updateItems={updateItems}/>
            </Modal>
        </div>
    )
}

export default ItemCard;