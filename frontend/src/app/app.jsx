import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import '../global.css'
import MainPage from "../pages/mainPage.jsx";
import ItemPage from "../pages/itemPage.jsx";
import AdminPage from "../pages/adminPage.jsx";
import NotFoundPage from "../pages/notFoundPage.jsx";
import {MetrikaHits} from "../utils/useMetrikaHits.js";

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <MetrikaHits/>
            <Routes>
                <Route path="/" element={<MainPage/>} />
                <Route path="/item/:id" element={<ItemPage />} />
                <Route path="/adm" element={<AdminPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)
