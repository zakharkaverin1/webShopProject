import NavBar from "../components/NavBar/NavBar.jsx";
import ItemGallery from "../components/ItemGallery/itemGallery.jsx";
import React, { useState, useEffect } from "react";
import {checkAdmin, getAllItems, getCategories} from "../api/api.js";
import { filterItemsByTitle } from "../utils/functions.js";
import styles from "./pages.module.scss";


const MainPage = () => {
    const [search, setSearch] = useState("");
    const [allItems, setAllItems] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [filterOpen, setFilterOpen] = useState(false);

    useEffect(() => {
        getAllItems().then(setAllItems);
        getCategories().then(setCategories);
    }, []);

    const updateItems = () => {
        getAllItems().then(setAllItems);
    };

    useEffect(() => {
        checkAdmin()
            .then(data => setIsAdmin(data.isAdmin))
            .catch(err => console.error(err));
    }, []);

    const filteredItems = allItems.filter(item => {
        const matchesSearch =
            filterItemsByTitle([item], search).length > 0;

        const matchesCategory =
            selectedCategory === null ||
            item.category_id === selectedCategory;

        return matchesSearch && matchesCategory;
    });

    const selectCategory = (categoryId) => {
        setSelectedCategory(categoryId);
        setFilterOpen(false);
    };

    return (
        <main className={styles.page}>
            <NavBar
                onSearch={setSearch}
                isAdmin={isAdmin}
            />

            <div className={styles.filterContainer}>
                <button
                    className={styles.filterButton}
                    onClick={() => setFilterOpen(true)}
                >
                    Фильтр
                </button>
            </div>

            {filterOpen && (
                <>
                    {/* Затемнение */}
                    <div
                        className={styles.filterOverlay}
                        onClick={() => setFilterOpen(false)}
                    />

                    {/* Боковое меню */}
                    <aside className={styles.filterMenu}>
                        <div className={styles.filterHeader}>
                            <h2>Фильтр</h2>

                            <button
                                className={styles.closeButton}
                                onClick={() => setFilterOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className={styles.categoryList}>
                            <button
                                className={
                                    selectedCategory === null
                                        ? styles.activeCategory
                                        : ""
                                }
                                onClick={() => selectCategory(null)}
                            >
                                Все товары
                            </button>

                            {categories.map(category => (
                                <button
                                    key={category.id}
                                    className={
                                        selectedCategory === category.id
                                            ? styles.activeCategory
                                            : ""
                                    }
                                    onClick={() =>
                                        selectCategory(category.id)
                                    }
                                >
                                    {category.name}
                                </button>
                            ))}
                        </div>
                    </aside>
                </>
            )}

            <ItemGallery
                items={filteredItems}
                isAdmin={isAdmin}
                updateItems={updateItems}
            />
        </main>
    );
};

export default MainPage;
