import {useState, useEffect} from "react";
import styles from "./NavBar.module.scss";
import Button from "../Button/Button.jsx";
import Field from "../Field/Field.jsx";
import SocialLinks from "../SocialLinks/socialLinks.jsx";
import Modal from "../Modal/modal.jsx";
import {
    getShopSettings,
    getAllOrders,
    deleteOrder,
    getCategories,
    addCategory,
    deleteCategory,
    setShopSettings
} from "../../api/api.js";
import ShopSettings from "../ShopSettings/ShopSettings.jsx";

const NavBar = ({onSearch, isAdmin}) => {
    const [localSearch, setLocalSearch] = useState("");
    const [settingsModal, setSettingsModal] = useState(false);
    const [orderModal, setOrderModal] = useState(false);
    const [categoryModal, setCategoryModal] = useState(false);
    const [shopName, setShopNameState] = useState("");
    const [orders, setOrders] = useState([]);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState("");
    const [loading, setLoading] = useState(false);
    const [categoriesLoading, setCategoriesLoading] = useState(false);
    const [titleColor, setTitleColor] = useState("#38342F");
    const [font, setFont] = useState("Poppins, sans-serif");

    useEffect(() => {
        getShopSettings()
            .then(data => {
                setShopNameState(data.shopName);
                setTitleColor(data.titleColor);
                setFont(data.font);
            })
            .catch(() => {
                setShopNameState("Магазин");
            });
    }, []);

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
        if (!window.confirm(`Вы уверены, что хотите удалить заказ ${orderId}?`)) return;

        deleteOrder(orderId)
            .then(() => {
                alert(`Заказ ${orderId} удален`);
                loadOrders();
            })
            .catch(() => alert("Не удалось удалить заказ"));
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return "Нет даты";

        return new Date(dateStr).toLocaleString("ru-RU", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const loadCategories = () => {
        setCategoriesLoading(true);

        getCategories()
            .then(setCategories)
            .catch(() => alert("Не удалось загрузить категории"))
            .finally(() => setCategoriesLoading(false));
    };

    const handleOpenCategories = () => {
        setCategoryModal(true);
        loadCategories();
    };

    const handleAddCategory = () => {
        const name = newCategory.trim();

        if (!name) {
            alert("Введите название категории");
            return;
        }

        addCategory(name)
            .then(() => {
                setNewCategory("");
                loadCategories();
            })
            .catch(error => alert(error.message || "Не удалось добавить категорию"));
    };

    const handleDeleteCategory = (categoryId) => {
        if (!window.confirm("Удалить эту категорию?")) return;

        deleteCategory(categoryId)
            .then(loadCategories)
            .catch(error => alert(error.message || "Не удалось удалить категорию"));
    };

    const handleSaveSettings = (settings) => {
        setShopSettings(settings)
            .then(data => {
                setShopNameState(data.shopName);
                setTitleColor(data.titleColor);
                setFont(data.font);
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
                    shopName={shopName}
                    onSave={handleSaveSettings}
                    onClose={() => setSettingsModal(false)}
                />
            </Modal>

            <Modal
                isOpen={orderModal}
                onClose={() => setOrderModal(false)}
            >
                <div className={styles.orderModal}>
                    <h3>Список заказов</h3>
                    {loading ? (
                        <p>Загрузка заказов...</p>
                    ) : orders.length === 0 ? (
                        <p className={styles.noOrders}>Заказов пока нет</p>
                    ) : (
                        <div className={styles.orderList}>
                            {orders.map(order => (
                                <div key={order.id} className={styles.orderItem}>
                                    <div className={styles.orderInfo}>
                                        <div className={styles.orderHeader}>
                                            <span className={styles.orderId}>
                                                Заказ {order.id}
                                            </span>

                                            <span className={styles.orderDate}>
                                                {formatDate(order.created_at)}
                                            </span>
                                        </div>
                                        <div>
                                            <p><strong>Клиент:</strong> {order.customer_name}</p>
                                            <p><strong>Телефон:</strong> {order.phone}</p>
                                            <p><strong>Товар ID:</strong> {order.item_id}</p>
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

            <Modal
                isOpen={categoryModal}
                onClose={() => setCategoryModal(false)}
            >
                <div>
                    <h3>Категории</h3>

                    {categoriesLoading ? (
                        <p>Загрузка категорий...</p>
                    ) : categories.length === 0 ? (
                        <p>Категорий пока нет</p>
                    ) : (
                        <div>
                            {categories.map(category => (
                                <div
                                    key={category.id}
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: "10px",
                                        marginBottom: "10px"
                                    }}
                                >
                                    <span>{category.name}</span>

                                    <Button onClick={() => handleDeleteCategory(category.id)}>
                                        Удалить
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    <div>
                        <input
                            type="text"
                            value={newCategory}
                            onChange={e => setNewCategory(e.target.value)}
                            placeholder="Название категории"
                            onKeyDown={e => {
                                if (e.key === "Enter") handleAddCategory();
                            }}
                        />
                        <Button onClick={handleAddCategory}>
                            Добавить
                        </Button>
                    </div>

                    <Button onClick={() => setCategoryModal(false)}>
                        Закрыть
                    </Button>
                </div>
            </Modal>

            <div
                className={styles.navBar}
            >
                <div
                    className={styles.logo}
                    style={{color: titleColor,
                        fontFamily: font}}
                >
                    {shopName}
                </div>
                {isAdmin && (
                    <>
                        <Button onClick={() => setSettingsModal(true)}>
                            Настройки магазина
                        </Button>
                        <Button onClick={handleOpenOrders}>
                            Посмотреть заказы
                        </Button>
                        <Button onClick={handleOpenCategories}>
                            Категории
                        </Button>
                    </>
                )}
                <div className={styles.searchContainer}>
                    <Field
                        className={styles.field}
                        placeholder="Поиск по названию"
                        value={localSearch}
                        onChange={i => setLocalSearch(i.target.value)}
                    />
                    <Button
                        className={styles.searchButton}
                        onClick={() => onSearch(localSearch)}
                    >
                        🔍
                    </Button>
                    <SocialLinks/>
                </div>
            </div>
        </>
    );
};

export default NavBar;