import React from 'react';
import Description from "../components/Description/Description.jsx";
import { Link, useParams } from 'react-router-dom';
import { parseItemId } from "../utils/seo.js"; // [SEO]
import styles from "./pages.module.scss";

const ItemPage = () => {
    // адрес вида /item/12-zerkalo-v-rame: товар ищем по id, slug поправит Description [SEO]
    const { id } = useParams();
    const itemId = parseItemId(id); // [SEO]

    return (
        <div className={styles.page}>
            <Link to="/" className={styles.backLink}>← Все товары</Link>
            <Description id={itemId}/>
        </div>
    );
};

export default ItemPage;
