import NavBar from "../components/NavBar/navBar.jsx";
import ItemGallery from "../components/ItemGallery/itemGallery.jsx";
import React, { useState } from "react";
import allItems from "../data/data.js";

const MainPage = () => {
    const [search, setSearch] = useState("");

    const filteredItems = allItems.filter(item => {
        return item.title.toLowerCase().includes(search.toLowerCase());
    });

    return (
        <main className="main-page">
            <NavBar onSearch={setSearch} />
            <ItemGallery items={filteredItems} />
        </main>
    )
}

export default MainPage;