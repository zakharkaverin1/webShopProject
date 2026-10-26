import styles from './itemCard.module.scss'
import {Link} from "react-router-dom";
import {useState} from "react";
import Modal from "../Modal/modal.jsx";
import DeleteForm from "../DeleteForm/DeleteForm.jsx";
import EditForm from "../EditForm/EditForm.jsx";
import Button from "../Button/Button.jsx";
import Placeholder from "../Placeholder/Placeholder.jsx";
import {formatPrice, getStatusLabel} from "../../utils/functions.js";
import {itemPath} from "../../utils/seo.js";

const ItemCard = (props) => {
    const {item, categories, isAdmin, updateItems} = props;
    const {id, title, price, images, category_id, materials, status} = item;
    const image = images?.[0];
    const category = categories?.find(c => c.id === category_id);

    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);

    return (
        <div className={`${styles.wrapper} ${status === 'sold' ? styles.sold : ''}`}>
            <Link to={itemPath(id, title)} className={styles.itemCard}>
                <div className={styles.imageBox}>
                    {image ? (
                        <img src={image} alt={`${title} — фото 1`} loading="lazy" decoding="async"/>
                    ) : (
                        <Placeholder seed={id}/>
                    )}
                    {status && status !== 'available' && (
                        <span className={`${styles.badge} ${styles[status]}`}>
                            {getStatusLabel(status)}
                        </span>
                    )}
                </div>
                <div className={styles.info}>
                    {category && <span className={styles.category}>{category.name}</span>}
                    <h3 className={styles.title}>{title}</h3>
                    {materials && <p className={styles.materials}>{materials}</p>}
                    <p className={styles.price}>{formatPrice(price)}</p>
                </div>
            </Link>

            {isAdmin && (
                <div className={styles.adminActions}>
                    <Button variant="secondary" onClick={() => setEditModal(true)}>
                        Изменить
                    </Button>
                    <Button variant="danger" onClick={() => setDeleteModal(true)}>
                        Удалить
                    </Button>
                </div>
            )}

            <Modal
                isOpen={editModal}
                onClose={() => {
                    setEditModal(false);
                    updateItems();
                }}
            >
                <EditForm
                    item={item}
                    categories={categories}
                    onClose={() => {
                        setEditModal(false);
                        updateItems();
                    }}
                />
            </Modal>

            <Modal
                isOpen={deleteModal}
                onClose={() => setDeleteModal(false)}
            >
                <DeleteForm
                    id={id}
                    title={title}
                    onClose={() => setDeleteModal(false)}
                    updateItems={updateItems}
                />
            </Modal>
        </div>
    )
}

export default ItemCard;
