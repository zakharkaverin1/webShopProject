import NavBar from "../components/NavBar/navBar.jsx";
import ItemGallery from "../components/ItemGallery/itemGallery.jsx";
import React, { useState } from "react";
import allItems from "../data/data.js";
import {filterItemsByTitle} from "../utils/functions.js";

const MainPage = () => {
    const [search, setSearch] = useState("");
    const filteredItems = filterItemsByTitle(allItems, search);

    return (
        <main className="main-page">
            <NavBar onSearch={setSearch} />
            <ItemGallery items={filteredItems} />
        </main>
    )
}

export default MainPage;