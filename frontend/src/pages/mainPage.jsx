import NavBar from "../components/NavBar/navBar.jsx";
import ItemGallery from "../components/ItemGallery/itemGallery.jsx";
import React, { useState, useEffect } from "react";
import {checkAdmin, getAllItems} from "../api/api.js";
import { filterItemsByTitle } from "../utils/functions.js";
import styles from "./pages.module.scss";

const MainPage = () => {
    const [search, setSearch] = useState("");
    const [allItems, setAllItems] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        getAllItems().then(setAllItems);
    }, []);

    const updateItems = () => {
        getAllItems().then(setAllItems);
    };
    useEffect(() => {
        checkAdmin()
            .then(data => setIsAdmin(data.isAdmin))
            .catch(err => console.error(err));
    }, []);

    const filteredItems = filterItemsByTitle(allItems, search);
    return (
        <main className={styles.page}>
            <NavBar onSearch={setSearch} isAdmin={isAdmin} />
            <ItemGallery items={filteredItems} isAdmin={isAdmin} updateItems={updateItems} />
        </main>
    )
}

export default MainPage;