import NavBar from "../components/NavBar/navBar.jsx";
import ItemGallery from "../components/ItemGallery/itemGallery.jsx";
import React from "react";
import allItems from "../data/data.js";




const MainPage = () => {
    return (
        <main className="main-page">
            <NavBar></NavBar>
            <ItemGallery items={allItems} />
        </main>
    )
}

export default MainPage;