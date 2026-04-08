import React from 'react';
import { useParams } from 'react-router-dom';
import Description from "../components/Description/Description.jsx";

const ItemPage = () => {
    const { id } = useParams();
    const itemId = Number(id);
    return (
        <div>
            <Description id={itemId}/>
        </div>
    );
};

export default ItemPage;