import React, { useState, useEffect } from "react";
import styles from "./Description.module.scss";
import { getItemById } from "../../utils/functions.js";
import Carousel from "../Carousel/Carousel.jsx";
import SocialLinks from "../SocialLinks/socialLinks.jsx";

const Description = (props) => {
    const { id } = props;
    const [item, setItem] = useState(null);

    useEffect(() => {
        getItemById(id).then(data => {
            setItem(data[0]);
        });
    }, [id]);

    if (!item) {
        return <div className={styles.description_not_found}>Товар не найден</div>;
    }
    return (
        <div className={styles.description}>
            <Carousel images={item.images} />
            <div className={styles.text_description}>
                <h1>{item.title}</h1>
                <p>{item.price} ₽</p>
                <p>{item.description}</p>
                <p className={styles.linksText}>Связь с нами</p>
                <SocialLinks />
            </div>
        </div>
    );
}

export default Description;