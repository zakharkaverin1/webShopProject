// [SEO] весь файл новый: страница 404 с noindex
import React from 'react';
import { Link } from 'react-router-dom';
import { useShopSettings } from "../utils/shopSettings.js";
import { useDocumentMeta } from "../utils/useDocumentMeta.js";
import styles from "./pages.module.scss";

// неизвестный адрес при переходе внутри сайта; при прямом заходе сервер отвечает 404 с тем же noindex
const NotFoundPage = () => {
    const shopName = useShopSettings()?.shopName;
    useDocumentMeta(shopName && `Страница не найдена | ${shopName}`, null, {noindex: true});

    return (
        <div className={styles.page}>
            <Link to="/" className={styles.backLink}>← На главную</Link>
            <h1>Страница не найдена</h1>
        </div>
    );
};

export default NotFoundPage;
