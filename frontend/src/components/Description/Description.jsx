import React, {useState, useEffect} from "react";
import styles from "./Description.module.scss";
import {getItemById} from "../../utils/functions.js";
import Carousel from "../Carousel/Carousel.jsx";
import SocialLinks from "../SocialLinks/socialLinks.jsx";
import Button from "../Button/Button.jsx";
import Modal from "../Modal/modal.jsx";
import OrderForm from "../OrderForm/OrderForm.jsx";

const Description = (props) => {
    const {id} = props;
    const [item, setItem] = useState(undefined);
    const [orderModal, setOrderModal] = useState(false);

    useEffect(() => {
        getItemById(id).then(data => {
            setItem(data[0]);
        });
    }, [id]);

    if (!item) {
        return <div className={styles.description_not_found}>Товар не найден</div>;
    }
    return (
        <>
            <Modal isOpen={orderModal} onClose={() => {setOrderModal(false)}}>
                <OrderForm itemId={id} itemTitle={item.title}></OrderForm>
            </Modal>
            <div className={styles.description}>
                <Carousel className={styles.carousel} images={item.images}/>
                <div className={styles.text_description}>
                    <h1>{item.title}</h1>
                    <p>Цена: {item.price} ₽</p>
                    <Button className={styles.orderButton} onClick={() => {setOrderModal(true)}}>Заказать</Button>
                    <p>{item.description}</p>
                    <p className={styles.linksText}>Связь с нами</p>
                    <div className={styles.socialLinksWrapper}>
                        <SocialLinks/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Description;