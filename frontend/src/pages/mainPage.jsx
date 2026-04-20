import NavBar from "../components/NavBar/navBar.jsx";
import ItemGallery from "../components/ItemGallery/itemGallery.jsx";
import React, { useState, useEffect } from "react";
import { getAllItems } from "../api/api.js";
import { filterItemsByTitle } from "../utils/functions.js";

const MainPage = () => {
    const [search, setSearch] = useState("");
    const [allItems, setAllItems] = useState([]);

    useEffect(() => {
        getAllItems().then(setAllItems);
    }, []);

    const filteredItems = filterItemsByTitle(allItems, search);
    return (
        <main className="main-page">
            <NavBar onSearch={setSearch} />
            <ItemGallery items={filteredItems} />
        </main>
    )
}

export default MainPage;