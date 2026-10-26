import React, {useState} from 'react';
import Button from "../Button/Button.jsx";
import styles from "./OrderForm.module.scss"
import {createOrderAPI} from "../../api/api.js";

// Без itemId форма работает как заявка на индивидуальный заказ
const OrderForm = (props) => {
    const {itemId = null, itemTitle, initialComment = '', onSuccess} = props;
    const isCustom = itemId === null;
    const [orderData, setOrderData] = useState({
        customerName: '',
        customerPhone: '',
        comment: initialComment,
    });
    const [isDispatching, setIsDispatching] = useState(false);

    const checkPhone = (phone) => {
        const digits = phone.replace(/\D/g, '');
        return digits.length === 11 || digits.length === 10;
    };

    const submitOrder = (e) => {
        e?.preventDefault();
        if (isDispatching) return;
        if (!orderData.customerName.trim()) {
            alert("Пожалуйста, укажите ваше имя");
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

        if (isCustom && !orderData.comment.trim()) {
            alert("Опишите, что бы вы хотели заказать");
            return;
        }

        const orderPayload = {
            customer_name: orderData.customerName.trim(),
            phone: orderData.customerPhone.replace(/\D/g, ''),
            comment: orderData.comment.trim(),
            item_id: itemId
        };

        setIsDispatching(true);

        createOrderAPI(orderPayload)
            .then(() => {
                alert(isCustom
                    ? "Заявка отправлена! Мы свяжемся с вами, чтобы обсудить детали."
                    : "Заказ оформлен! Мы скоро свяжемся с вами.");
                setOrderData({
                    customerName: '',
                    customerPhone: '',
                    comment: '',
                });
                onSuccess?.();
            })
            .catch(error => {
                console.error("Ошибка при создании заказа:", error);
                alert(`Не удалось отправить: ${error.message}`);
            })
            .finally(() => {
                setIsDispatching(false);
            });
    };

    const updateOrderData = (fieldName, value) => {
        setOrderData(prev => ({
            ...prev,
            [fieldName]: value
        }));
    };

    return (
        <form className={styles.form} onSubmit={submitOrder}>
            <h2 className={styles.title}>
                {isCustom ? 'Индивидуальный заказ' : 'Оформление заказа'}
            </h2>
            {isCustom ? (
                <p className={styles.lead}>
                    Расскажите об идее: что за изделие, размеры, цвета, где будет стоять или висеть.
                    Можно приложить ссылки на примеры.
                </p>
            ) : (
                <p className={styles.itemInfo}>{itemTitle}</p>
            )}

            <div className={styles.fieldGroup}>
                <input
                    required
                    className={styles.input}
                    placeholder="Ваше имя"
                    value={orderData.customerName}
                    name="customerName"
                    type='text'
                    autoComplete="name"
                    onChange={(e) => updateOrderData('customerName', e.target.value)}
                />
            </div>

            <div className={styles.fieldGroup}>
                <input
                    required
                    className={styles.input}
                    placeholder="Телефон"
                    value={orderData.customerPhone}
                    name="customerPhone"
                    type='tel'
                    autoComplete="tel"
                    onChange={(e) => updateOrderData('customerPhone', e.target.value)}
                />
            </div>

            <div className={styles.fieldGroup}>
                <textarea
                    className={styles.textarea}
                    placeholder={isCustom
                        ? "Например: круглое зеркало ~70 см в раме из ротанга, светлый оттенок"
                        : "Комментарий к заказу. Можете оставить удобный способ связи (Telegram, WhatsApp)."}
                    value={orderData.comment}
                    name="comment"
                    onChange={(e) => updateOrderData('comment', e.target.value)}
                    rows="4"
                />
            </div>

            <Button type="submit" className={styles.orderButton} disabled={isDispatching}>
                {isDispatching ? 'Отправка...' : isCustom ? 'Отправить заявку' : 'Подтвердить заказ'}
            </Button>
            <p className={styles.note}>Оплата после согласования деталей — мы свяжемся с вами.</p>
        </form>
    );
};

export default OrderForm;
