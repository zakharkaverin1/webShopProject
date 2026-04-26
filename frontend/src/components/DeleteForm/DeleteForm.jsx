import React, { useState, useEffect } from 'react';
import styles from './DeleteForm.module.scss';
import {getAllItems, deleteItem} from "../../api/api.js";

const DeleteForm = () => {
    const [items, setItems] = useState([]);

    const loadItems = () => {
        getAllItems()
            .then(data => {
                setItems(data);
            })
            .catch(error => {
                alert("Не получилось загрузить товары", error);
            });
    };

    useEffect(() => {
        loadItems();
    }, []);



    const handleDelete = (productId, productTitle) => {

        if (confirm(`Удалить "${productTitle}"?`)) {
            deleteItem(productId)
                .then(() => {
                    alert("Товар удален");
                    loadItems();
                })
                .catch((error) => {
                    alert(`Ошибка при удалении: ${error.message}`);
                });
        }
    };

    return (
        <div className={styles.form}>
            <h1>Удаление товаров</h1>

            <div className={styles.itemList}>
                {items.map(product => (
                    <div key={product.id} className={styles.item}>
                        <div className={styles.itemInfo}>
                            <strong>{product.title}</strong>
                            <span>{product.price}₽</span>
                        </div>
                        <button
                            className={styles.deleteButton}
                            onClick={() => handleDelete(product.id, product.title)}
                        >
                            ✕
                        </button>
                    </div>
                ))}

                {items.length === 0 && (
                    <div className={styles.empty}>Нет товаров</div>
                )}
            </div>
        </div>
    );
};

export default DeleteForm;