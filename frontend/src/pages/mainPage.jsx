import NavBar from "../components/NavBar/NavBar.jsx";
import ItemGallery from "../components/ItemGallery/itemGallery.jsx";
import Hero from "../components/Hero/Hero.jsx";
import Footer from "../components/Footer/Footer.jsx";
import CategoryDropdown from "../components/CategoryDropdown/CategoryDropdown.jsx";
import Modal from "../components/Modal/modal.jsx";
import OrderForm from "../components/OrderForm/OrderForm.jsx";
import React, { useState, useEffect, useCallback } from "react";
import {checkAdmin, getAllItems, getCategories, logoutAdmin} from "../api/api.js";
import { filterItemsByTitle, sortItems, SORT_OPTIONS } from "../utils/functions.js";
import { useShopSettings } from "../utils/shopSettings.js";
import { useDocumentMeta } from "../utils/useDocumentMeta.js";
import { homeMeta } from "../utils/seo.js"; // [SEO]
import { useSearchParams } from "react-router-dom"; // [SEO]
import styles from "./pages.module.scss";


const MainPage = () => {
    // /?category=3 — ссылка на раздел из «хлебных крошек» товара [SEO]
    const [searchParams] = useSearchParams(); // [SEO]
    const [search, setSearch] = useState("");
    const [allItems, setAllItems] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(() => Number(searchParams.get("category")) || null); // [SEO]
    const [sort, setSort] = useState("new");
    const [customOrderModal, setCustomOrderModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const shopName = useShopSettings()?.shopName;

    // тексты совпадают с теми, что подставляет сервер (backend/seo.py) [SEO]
    const meta = shopName ? homeMeta(shopName) : null; // [SEO]
    useDocumentMeta(meta?.title, meta?.description); // [SEO]
    // при поиске Hero скрыт, и заголовок каталога становится единственным h1 [SEO]
    const CatalogHeading = search ? "h1" : "h2"; // [SEO]

    const updateItems = useCallback(() => {
        return getAllItems()
            .then(items => {
                setAllItems(Array.isArray(items) ? items : []);
                setError("");
            })
            .catch(() => setError("Не удалось загрузить товары. Попробуйте обновить страницу."))
            .finally(() => setLoading(false));
    }, []);

    const updateCategories = useCallback(() => {
        return getCategories()
            .then(result => setCategories(Array.isArray(result) ? result : []))
            .catch(err => console.error("Ошибка загрузки категорий:", err));
    }, []);

    useEffect(() => {
        updateItems();
        updateCategories();
        checkAdmin().then(setIsAdmin);
    }, [updateItems, updateCategories]);

    // если выбранную категорию удалили — считаем, что фильтр сброшен
    const activeCategory = categories.some(c => c.id === selectedCategory)
        ? selectedCategory
        : null;

    const filteredItems = sortItems(
        filterItemsByTitle(allItems, search).filter(item =>
            activeCategory === null || item.category_id === activeCategory
        ),
        sort
    );

    const handleLogout = () => {
        if (!window.confirm("Выйти из режима администратора?")) return;

        logoutAdmin()
            .then(() => setIsAdmin(false))
            .catch(() => alert("Не удалось выйти из админ-режима"));
    };

    const openCustomOrder = () => setCustomOrderModal(true);

    const renderContent = () => {
        if (loading) {
            return <div className={styles.state}>Загрузка товаров...</div>;
        }
        if (error) {
            return (
                <div className={styles.state}>
                    <p>{error}</p>
                    <button className={styles.retryButton} onClick={updateItems}>Повторить</button>
                </div>
            );
        }
        return (
            <ItemGallery
                items={filteredItems}
                isAdmin={isAdmin}
                categories={categories}
                updateItems={updateItems}
                emptyText={
                    allItems.length === 0
                        ? "Товаров пока нет"
                        : "По вашему запросу ничего не найдено"
                }
            />
        );
    };

    return (
        <main className={styles.page}>
            <Modal isOpen={customOrderModal} onClose={() => setCustomOrderModal(false)}>
                <OrderForm onSuccess={() => setCustomOrderModal(false)}/>
            </Modal>

            {/* [ОПТ] NavBar получает categories отсюда и больше не грузит их сам */}
            <NavBar
                search={search}
                onSearch={setSearch}
                isAdmin={isAdmin}
                onLogout={handleLogout}
                categories={categories}
                onCategoriesChange={updateCategories}
            />

            {!search && (
                <Hero onCustomOrder={openCustomOrder}/>
            )}

            <section id="catalog" className={`container ${styles.catalog}`}>
                <div className={styles.catalogHeader}>
                    <CatalogHeading className={styles.catalogTitle}>
                        {search ? `Поиск: «${search}»` : "Каталог"}
                        {!loading && !error && (
                            <span className={styles.count}>{filteredItems.length}</span>
                        )}
                    </CatalogHeading>
                    <div className={styles.filters}>
                        {categories.length > 0 && (
                            <CategoryDropdown
                                categories={categories}
                                value={activeCategory}
                                onChange={setSelectedCategory}
                            />
                        )}
                        <label className={styles.sort}>
                            <span>Сортировка</span>
                            <select
                                className="select"
                                value={sort}
                                onChange={e => setSort(e.target.value)}
                            >
                                {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                </div>

                {renderContent()}
            </section>

            <Footer onCustomOrder={openCustomOrder}/>
        </main>
    );
};

export default MainPage;
