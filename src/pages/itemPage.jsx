import React from 'react';
import { useParams } from 'react-router-dom';
import allItems from "../data/data.js";

const ItemPage = () => {
    const { id } = useParams();
    const itemId = Number(id);
    const item = allItems.find(item => item.id === itemId);
    if (!item) {
        return <div>Товар не найден</div>;
    }
    return (
        <div>
            <h1>{item.title}</h1>
            <p>ID товара из URL: {id}</p>
            <img src={item.image} alt={item.title} />
            <p>Цена: ${item.price}</p>
        </div>
    );
};

export default ItemPage;