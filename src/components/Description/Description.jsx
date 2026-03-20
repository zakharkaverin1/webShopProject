import React from "react";
import styles from "./Description.module.scss";
import { getItemById } from "../../utils/functions.js"; // .js можно опустить

const Description = (props) => {
    const {id} = props;
    const item = getItemById(id)

    if (!item) {
        return <div className={styles.description_not_found}>Товар не найден</div>;
    }

    return (
        <div className={styles.description}>
            <img src={item.image} alt={item.title} />
            <div className={styles.text_description}>
                <h1>{item.title}</h1>
                <p>{item.price} ₽</p>
            </div>
        </div>
    );
}

export default Description;