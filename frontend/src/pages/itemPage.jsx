import React from 'react';
import Description from "../components/Description/Description.jsx";
import { useParams, useLocation } from 'react-router-dom';
import styles from "./pages.module.scss";

const ItemPage = () => {
    const { id } = useParams();
    const itemId = Number(id);
    const { isAdmin } = useLocation().state || {};

    return (
        <div className={styles.page}>
            <Description id={itemId} isAdmin={isAdmin}/>
        </div>
    );
};

export default ItemPage;