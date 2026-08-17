import { useState, useEffect } from "react";
import styles from "./navBar.module.scss";
import Button from "../Button/Button.jsx";
import Field from "../Field/Field.jsx";
import SocialLinks from "../SocialLinks/socialLinks.jsx";
import Modal from "../Modal/modal.jsx";
import { getShopName, setShopName, getAllOrders, deleteOrder } from "../../api/api.js";
import {getItemById} from "../../utils/functions.js";

const NavBar = (props) => {
    const { onSearch, isAdmin } = props;
    const [localSearch, setLocalSearch] = useState("");
    const [editModal, setEditModal] = useState(false);
    const [orderModal, setOrderModal] = useState(false);
    const [shopName, setShopNameState] = useState("");
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getShopName()
            .then(name => {
                setShopNameState(name);
            })
            .catch(error => {
                setShopNameState("Магазин");
            });
    }, []);

    const loadOrders = () => {
        setLoading(true);
        getAllOrders()
            .then(data => {
                setOrders(data);
                setLoading(false);
            })
            .catch(error => {
                alert("Не удалось загрузить заказы");
                setLoading(false);
            });
    };

    const handleOpenOrders = () => {
        setOrderModal(true);
        loadOrders();
    };

    const handleDeleteOrder = (orderId) => {
        if (window.confirm(`Вы уверены, что хотите удалить заказ ${orderId}?`)) {
            deleteOrder(orderId)
                .then(() => {
                    alert(`Заказ ${orderId} удален`);
                    loadOrders();
                })
                .catch(error => {
                    alert("Не удалось удалить заказ");
                });
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "Нет даты";
        const date = new Date(dateStr);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleSubmit = () => {
        if (shopName.trim()) {
            setShopName(shopName)
                .then(() => {
                    setEditModal(false);
                })
                .catch(error => {
                    console.error("Ошибка сохранения:", error);
                    alert("Не удалось сохранить название");
                });
        }
    };

    return (
        <>
            <Modal isOpen={editModal} onClose={() => {setEditModal(false)}}>
                <div>
                    <h3>Редактировать название</h3>
                    <input
                        type="text"
                        value={shopName}
                        onChange={(e) => setShopNameState(e.target.value)}
                        placeholder="Название магазина"
                    />
                    <div>
                        <button onClick={() => setEditModal(false)}>Отмена</button>
                        <button onClick={handleSubmit}>Сохранить</button>
                    </div>
                </div>
            </Modal>

            <Modal isOpen={orderModal} onClose={() => {setOrderModal(false)}}>
                <div className={styles.orderModal}>
                    <h3>Список заказов</h3>
                    {loading ? (
                        <p>Загрузка заказов...</p>
                    ) : orders.length === 0 ? (
                        <p className={styles.noOrders}>Заказов пока нет</p>
                    ) : (
                        <div className={styles.orderList}>
                            {orders.map((order) => (
                                <div key={order.id} className={styles.orderItem}>
                                    <div className={styles.orderInfo}>
                                        <div className={styles.orderHeader}>
                                            <span className={styles.orderId}>Заказ {order.id}</span>
                                            <span className={styles.orderDate}>
                                                {formatDate(order.created_at)}
                                            </span>
                                        </div>
                                        <div>
                                            <p><strong>Клиент:</strong> {order.customer_name}</p>
                                            <p><strong>Телефон:</strong> {order.phone}</p>
                                            <p><strong>Товар ID:</strong> {order.item_id }</p>
                                            {order.comment && (
                                                <p><strong>Комментарий:</strong> {order.comment}</p>
                                            )}
                                        </div>
                                    </div>
                                    <div className={styles.orderActions}>
                                        <Button
                                            className={styles.deleteButton}
                                            onClick={() => handleDeleteOrder(order.id)}
                                        >
                                            Удалить
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className={styles.orderModalFooter}>
                        <Button onClick={() => setOrderModal(false)}>
                            Закрыть
                        </Button>
                        <Button onClick={loadOrders}>
                             Обновить
                        </Button>
                    </div>
                </div>
            </Modal>

            <div className={styles.navBar}>
                <div className={styles.logo}>
                    {shopName}
                </div>
                {isAdmin && (
                    <>
                        <Button onClick={() => setEditModal(true)}>
                            Редактировать логотип
                        </Button>
                        <Button onClick={handleOpenOrders}>
                            Посмотреть заказы
                        </Button>
                    </>
                )}

                <div className={styles.searchContainer}>
                    <Field
                        className={styles.field}
                        placeholder="Поиск по названию"
                        value={localSearch}
                        onChange={(i) => setLocalSearch(i.target.value)}
                    />
                    <Button
                        className={styles.searchButton}
                        onClick={() => onSearch(localSearch)}
                    >
                        🔍︎
                    </Button>
                    <SocialLinks/>
                </div>
            </div>
        </>
    );
}

export default NavBar;