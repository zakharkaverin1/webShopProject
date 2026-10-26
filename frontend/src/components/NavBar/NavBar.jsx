import {useState} from "react";
import {Link} from "react-router-dom";
import styles from "./NavBar.module.scss";
import Button from "../Button/Button.jsx";

import SocialLinks from "../SocialLinks/socialLinks.jsx";
import Modal from "../Modal/modal.jsx";
import {
    getAllOrders,
    deleteOrder,
    addCategory,
    deleteCategory,
    setShopSettings
} from "../../api/api.js";
import {formatDate} from "../../utils/functions.js";
import {itemPath} from "../../utils/seo.js";
import {DEFAULT_SETTINGS, setShopSettingsCache, useShopSettings} from "../../utils/shopSettings.js";
import ShopSettings from "../ShopSettings/ShopSettings.jsx";

const NavBar = ({search, onSearch, isAdmin, onLogout, categories, onCategoriesChange}) => {
    const [settingsModal, setSettingsModal] = useState(false);
    const [orderModal, setOrderModal] = useState(false);
    const [categoryModal, setCategoryModal] = useState(false);
    const [orders, setOrders] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const settings = useShopSettings();

    const loadOrders = () => {
        setLoading(true);
        getAllOrders()
            .then(data => setOrders(data))
            .catch(() => alert("Не удалось загрузить заказы"))
            .finally(() => setLoading(false));
    };

    const handleOpenOrders = () => {
        setOrderModal(true);
        loadOrders();
    };

    const handleDeleteOrder = (orderId) => {
        if (!window.confirm(`Удалить заказ №${orderId}?`)) return;

        deleteOrder(orderId)
            .then(() => setOrders(prev => prev.filter(order => order.id !== orderId)))
            .catch(() => alert("Не удалось удалить заказ"));
    };

    const handleAddCategory = (e) => {
        e?.preventDefault();
        const name = newCategory.trim();

        if (!name) {
            alert("Введите название категории");
            return;
        }

        addCategory(name)
            .then(() => {
                setNewCategory("");
                onCategoriesChange?.();
            })
            .catch(error => alert(
                error.message === "Category already exists"
                    ? "Такая категория уже есть"
                    : error.message || "Не удалось добавить категорию"
            ));
    };

    const handleDeleteCategory = (categoryId) => {
        if (!window.confirm("Удалить эту категорию?")) return;
        deleteCategory(categoryId)
            .then(() => onCategoriesChange?.())
            .catch(() => alert("Не удалось удалить категорию. Возможно, в ней есть товары."));
    };

    const handleSaveSettings = (newSettings) => {
        return setShopSettings(newSettings)
            .then(data => {
                setShopSettingsCache(data);
                setSettingsModal(false);
            })
            .catch(error => {
                alert(error.message || "Не удалось сохранить настройки");
            });
    };

    return (
        <>
            <Modal
                isOpen={settingsModal}
                onClose={() => setSettingsModal(false)}
            >
                <ShopSettings
                    settings={settings || DEFAULT_SETTINGS}
                    onSave={handleSaveSettings}
                    onClose={() => setSettingsModal(false)}
                />
            </Modal>
            <Modal
                isOpen={orderModal}
                onClose={() => setOrderModal(false)}
            >
                <div className={styles.orderModal}>
                    <h3>Заказы</h3>
                    {loading ? (
                        <p className={styles.noOrders}>Загрузка заказов...</p>
                    ) : orders.length === 0 ? (
                        <p className={styles.noOrders}>Заказов пока нет</p>
                    ) : (
                        <div className={styles.orderList}>
                            {orders.map(order => (
                                <div key={order.id} className={styles.orderItem}>
                                    <div className={styles.orderInfo}>
                                        <div className={styles.orderHeader}>
                                            <span className={styles.orderId}>
                                                Заказ №{order.id}
                                            </span>
                                            <span className={styles.orderDate}>
                                                {formatDate(order.created_at)}
                                            </span>
                                        </div>
                                        <p><strong>Клиент:</strong> {order.customer_name}</p>
                                        <p>
                                            <strong>Телефон:</strong>{" "}
                                            <a href={`tel:+${order.phone}`}>{order.phone}</a>
                                        </p>
                                        <p>
                                            <strong>Товар:</strong>{" "}
                                            {order.item_id === null ? (
                                                <span className={styles.custom}>Индивидуальный заказ</span>
                                            ) : order.item_title ? (
                                                <Link to={itemPath(order.item_id, order.item_title)}>{order.item_title}</Link>
                                            ) : (
                                                <span className={styles.deleted}>удалён (ID {order.item_id})</span>
                                            )}
                                        </p>
                                        {order.comment && (
                                            <p className={styles.comment}><strong>Комментарий:</strong> {order.comment}</p>
                                        )}
                                    </div>
                                    <Button
                                        variant="secondary"
                                        className={styles.deleteButton}
                                        onClick={() => handleDeleteOrder(order.id)}
                                    >
                                        Удалить
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className={styles.orderModalFooter}>
                        <Button variant="secondary" onClick={() => setOrderModal(false)}>
                            Закрыть
                        </Button>
                        <Button onClick={loadOrders} disabled={loading}>
                            Обновить
                        </Button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={categoryModal}
                onClose={() => setCategoryModal(false)}
            >
                <div>
                    <h3>Категории</h3>

                    <form className={styles.categoryForm} onSubmit={handleAddCategory}>
                        <input
                            className="input"
                            type="text"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                            placeholder="Новая категория"
                        />
                        <Button type="submit">Добавить</Button>
                    </form>

                    {categories.length === 0 ? (
                        <p className={styles.noOrders}>Категорий пока нет</p>
                    ) : (
                        <ul className={styles.categoryList}>
                            {categories.map(category => (
                                <li key={category.id} className={styles.categoryItem}>
                                    <span>{category.name}</span>
                                    <Button
                                        variant="ghost"
                                        className={styles.deleteButton}
                                        onClick={() => handleDeleteCategory(category.id)}
                                        aria-label={`Удалить категорию ${category.name}`}
                                    >
                                        Удалить
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Modal>

            <header className={styles.navBar}>
                <Link
                    to="/"
                    className={styles.logo}
                    style={{
                        color: settings?.titleColor,
                        fontFamily: settings?.font
                    }}
                >
                    {settings?.shopName ?? " "}
                </Link>
                <div className={styles.searchContainer}>
                    <input
                        className={styles.searchInput}
                        type="search"
                        aria-label="Поиск по названию"
                        placeholder="Поиск по названию"
                        autoComplete="off"
                        value={search}
                        onChange={e => onSearch(e.target.value)}
                    />
                    <SocialLinks/>
                </div>
            </header>

            {isAdmin && (
                <div className={styles.adminBar}>
                    <span className={styles.adminLabel}>Режим администратора</span>
                    <div className={styles.adminButtons}>
                        <Button variant="ghost" onClick={handleOpenOrders}>Заказы</Button>
                        <Button variant="ghost" onClick={() => setCategoryModal(true)}>Категории</Button>
                        <Button variant="ghost" onClick={() => setSettingsModal(true)}>Настройки</Button>
                        <Button variant="secondary" onClick={onLogout}>Выйти</Button>
                    </div>
                </div>
            )}
        </>
    );
};

export default NavBar;
