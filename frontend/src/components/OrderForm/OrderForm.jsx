import React, {useState} from 'react';
import Button from "../Button/Button.jsx";
import styles from "./OrderForm.module.scss"
import {createOrderAPI} from "../../api/api.js";


const OrderForm = (props) => {
    const {itemId, itemTitle} = props;
    const [orderData, setOrderData] = useState({
        customerName: '',
        customerPhone: '',
        comment: '',
        itemId: itemId
    });
    const [isDispatching, setIsDispatching] = useState(false);

    const checkPhone = (phone) => {
        const digits = phone.replace(/\D/g, '');
        return digits.length === 11 || digits.length === 10;
    };

    const submitOrder = () => {
        if (!orderData.customerName.trim()) {
            alert("Пожалуйста, укажите имя заказчика");
            return;
        }
        if (!orderData.customerPhone.trim()) {
            alert("Пожалуйста, укажите номер телефона");
            return;
        }

        if (!checkPhone(orderData.customerPhone)) {
            alert("Пожалуйста, введите корректный российский номер телефона (например: 8 912 345-67-89 или 9123456789)");
            return;
        }

        const formattedPhone = orderData.customerPhone.replace(/\D/g, '');
        const orderPayload = {
            customer_name: orderData.customerName,
            phone: formattedPhone,
            comment: orderData.comment || '',
            item_id: orderData.itemId
        };

        setIsDispatching(true);

        createOrderAPI(orderPayload)
            .then(() => {
                alert("Заказ подтвержден!");
                setOrderData({
                    customerName: '',
                    customerPhone: '',
                    comment: '',
                    itemId: itemId
                });
            })
            .catch(error => {
                console.error("Ошибка при создании заказа:", error);
                alert(`Не удалось подтвердить заказ: ${error.message}`);
            })
            .finally(() => {
                setIsDispatching(false);
            });
    };

    const updateOrderData = (fieldName, value) => {
        setOrderData({
            ...orderData,
            [fieldName]: value
        });
    };

    return (
        <div className={styles.form}>
            <h2 className={styles.title}>Оформление заказа</h2>
            <p className={styles.itemInfo}>{itemTitle}</p>

            <div className={styles.fieldGroup}>
                <input
                    required
                    className={styles.input}
                    placeholder="Имя заказчика (обязательно)"
                    value={orderData.customerName}
                    name="customerName"
                    type='text'
                    onChange={(e) => updateOrderData('customerName', e.target.value)}
                />
            </div>

            <div className={styles.fieldGroup}>
                <input
                    required
                    className={styles.input}
                    placeholder="Телефон (обязательно)"
                    value={orderData.customerPhone}
                    name="customerPhone"
                    type='tel'
                    onChange={(e) => updateOrderData('customerPhone', e.target.value)}
                />
            </div>

            <div className={styles.fieldGroup}>
                <textarea
                    className={styles.textarea}
                    placeholder="Комментарий к заказу. При желании Вы можете оставить другие способы связи с вами."
                    value={orderData.comment}
                    name="comment"
                    onChange={(e) => updateOrderData('comment', e.target.value)}
                    rows="4"
                    cols="50"
                />
            </div>

            <Button className={styles.orderButton} onClick={submitOrder} disabled={isDispatching}>
                {isDispatching ? 'Отправка...' : 'Подтвердить заказ'}
            </Button>
        </div>
    );
};

export default OrderForm;