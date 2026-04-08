import React from 'react'
import ReactDOM from 'react-dom/client'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import MainPage from "../pages/mainPage.jsx";
import ItemPage from "../pages/itemPage.jsx";
import '../global.css'
import AdminPage from "../pages/adminPage.jsx";
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainPage/>} />
                <Route path="/item/:id" element={<ItemPage />} />
                <Route path="/adm/:password" element={<AdminPage />} />
            </Routes>
        </BrowserRouter>
    </React.StrictMode>
)