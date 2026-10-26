import {useState} from "react";
import styles from './itemGallery.module.scss'
import ItemCard from "../ItemCard/itemCard.jsx";
import AddForm from "../AddForm/AddForm.jsx";
import Modal from "../Modal/modal.jsx";

const ItemGallery = (props) => {
    const {items, isAdmin, categories, updateItems, emptyText} = props;
    const [addModal, setAddModal] = useState(false);

    return (
        <>
            <Modal isOpen={addModal} onClose={() => setAddModal(false)}>
                <AddForm
                    categories={categories}
                    updateItems={updateItems}
                    onClose={() => setAddModal(false)}
                />
            </Modal>

            {!isAdmin && items.length === 0 ? (
                <p className={styles.empty}>{emptyText}</p>
            ) : (
                <div className={styles.ItemGallery}>
                    {isAdmin && (
                        <button className={styles.addCard} onClick={() => setAddModal(true)}>
                            <span className={styles.addIcon}>+</span>
                            <span>Добавить товар</span>
                        </button>
                    )}
                    {items.map(item => (
                        <ItemCard
                            key={item.id}
                            item={item}
                            categories={categories}
                            isAdmin={isAdmin}
                            updateItems={updateItems}
                        />
                    ))}
                </div>
            )}
        </>
    )
}

export default ItemGallery
