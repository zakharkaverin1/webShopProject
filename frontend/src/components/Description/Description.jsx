import React, {useState, useEffect} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import styles from "./Description.module.scss";
import {getAllItems, getCategories, getItem} from "../../api/api.js";
import {formatPrice, getStatusLabel} from "../../utils/functions.js";
import Carousel from "../Carousel/Carousel.jsx";
import SocialLinks from "../SocialLinks/socialLinks.jsx";
import Button from "../Button/Button.jsx";
import Modal from "../Modal/modal.jsx";
import OrderForm from "../OrderForm/OrderForm.jsx";
import Placeholder from "../Placeholder/Placeholder.jsx";
import {useShopSettings} from "../../utils/shopSettings.js";
import {useDocumentMeta} from "../../utils/useDocumentMeta.js";
import {itemPath, productDescription, productTitle} from "../../utils/seo.js";

const SIMILAR_LIMIT = 4;

const ORDER_HINTS = {
    available: "Готово к отправке. Оставьте заявку — мы свяжемся для уточнения доставки.",
    made_to_order: "Изготовим специально для вас. Срок — обычно 1–3 недели, точнее подскажем после заявки.",
    sold: "Этот экземпляр уже нашёл своего владельца. Можем сделать похожий на заказ.",
};

const Description = (props) => {
    const {id} = props;
    const [result, setResult] = useState({id: null, item: null});
    const [similar, setSimilar] = useState([]);
    const [orderModal, setOrderModal] = useState(null);
    const isValidId = Number.isInteger(id) && id > 0;

    useEffect(() => {
        if (!isValidId) return;
        let cancelled = false;
        getItem(id)
            .then(data => {
                if (!cancelled) setResult({id, item: data});
            })
            .catch(() => {
                if (!cancelled) setResult({id, item: null});
            });
        return () => {
            cancelled = true;
        };
    }, [id, isValidId]);

    const item = result.id === id ? result.item : undefined;
    const categoryId = item?.category_id;
    const shopName = useShopSettings()?.shopName;
    const [categories, setCategories] = useState(null);
    const navigate = useNavigate();
    const {pathname, search} = useLocation();

    useEffect(() => {
        let cancelled = false;
        getCategories()
            .then(data => {
                if (!cancelled) setCategories(Array.isArray(data) ? data : []);
            })
            .catch(() => {
                if (!cancelled) setCategories([]);
            });
        return () => {
            cancelled = true;
        };
    }, []);

    const canonicalPath = item ? itemPath(item.id, item.title) : null;
    useEffect(() => {
        if (canonicalPath && pathname !== canonicalPath) {
            navigate(canonicalPath + search, {replace: true});
        }
    }, [canonicalPath, pathname, search, navigate]);

    const categoryName = categories?.find(c => c.id === categoryId)?.name;
    const metaReady = item && shopName && categories;
    const notFound = item === null || !isValidId;
    useDocumentMeta(
        metaReady ? productTitle(item.title, categoryName, shopName)
            : (notFound && shopName ? `Товар не найден | ${shopName}` : null),
        metaReady ? productDescription(item, categoryName)
            : (notFound ? 'Такого товара нет или он был удалён.' : null),
        {noindex: notFound}
    );

    useEffect(() => {
        if (!categoryId) return;
        let cancelled = false;
        getAllItems()
            .then(items => {
                if (cancelled) return;
                setSimilar(items
                    .filter(other => other.category_id === categoryId && other.id !== id && other.status !== 'sold')
                    .slice(0, SIMILAR_LIMIT));
            })
            .catch(() => {});
        return () => {
            cancelled = true;
        };
    }, [categoryId, id]);

    if (isValidId && result.id !== id) {
        return <div className={styles.description_not_found}>Загрузка...</div>;
    }
    if (!item) {
        return <div className={styles.description_not_found}>Товар не найден</div>;
    }

    const status = item.status || 'available';
    const isSold = status === 'sold';
    const details = [
        ["Материалы", item.materials],
        ["Размеры", item.dimensions],
    ].filter(([, value]) => value);

    return (
        <>
            <div className={styles.description}>
                <Modal isOpen={orderModal !== null} onClose={() => setOrderModal(null)}>
                    {orderModal === 'item' ? (
                        <OrderForm
                            itemId={id}
                            itemTitle={item.title}
                            onSuccess={() => setOrderModal(null)}
                        />
                    ) : (
                        <OrderForm
                            initialComment={`Хочу похожее на «${item.title}»`}
                            onSuccess={() => setOrderModal(null)}
                        />
                    )}
                </Modal>
                <Carousel key={item.id} images={item.images} seed={item.id} title={item.title}/>
                <div className={styles.text_description}>
                    <span className={`${styles.status} ${styles[status]}`}>{getStatusLabel(status)}</span>
                    <h1 className={styles.title}>{item.title}</h1>
                    <p className={styles.price}>{formatPrice(item.price)}</p>

                    {details.length > 0 && (
                        <dl className={styles.details}>
                            {details.map(([label, value]) => (
                                <div key={label}>
                                    <dt>{label}</dt>
                                    <dd>{value}</dd>
                                </div>
                            ))}
                        </dl>
                    )}

                    <div className={styles.orderBlock}>
                        {isSold ? (
                            <Button variant="accent" className={styles.orderButton} onClick={() => setOrderModal('custom')}>
                                Заказать похожее
                            </Button>
                        ) : (
                            <Button variant="accent" className={styles.orderButton} onClick={() => setOrderModal('item')}>
                                {status === 'made_to_order' ? 'Заказать изготовление' : 'Заказать'}
                            </Button>
                        )}
                        <p className={styles.hint}>{ORDER_HINTS[status] || ORDER_HINTS.available}</p>
                    </div>

                    {item.description && (
                        <p className={styles.text}>{item.description}</p>
                    )}

                    <p className={styles.handmadeNote}>
                        Изделие сделано вручную, поэтому оттенки и фактура могут немного отличаться от фотографий.
                    </p>

                    <div className={styles.contacts}>
                        <p className={styles.linksText}>Есть вопросы? Напишите нам</p>
                        <SocialLinks/>
                    </div>
                </div>
            </div>

            {similar.length > 0 && (
                <section className={styles.similar}>
                    <h2>Похожие изделия</h2>
                    <div className={styles.similarGrid}>
                        {similar.map(other => (
                            <Link key={other.id} to={itemPath(other.id, other.title)} className={styles.similarCard}>
                                <div className={styles.similarImage}>
                                    {other.images?.[0] ? (
                                        <img src={other.images[0]} alt={`${other.title} — фото 1`} loading="lazy" decoding="async"/>
                                    ) : (
                                        <Placeholder seed={other.id} text=""/>
                                    )}
                                </div>
                                <span className={styles.similarTitle}>{other.title}</span>
                                <span className={styles.similarPrice}>{formatPrice(other.price)}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}

export default Description;
