import styles from './Footer.module.scss';
import SocialLinks from "../SocialLinks/socialLinks.jsx";
import Button from "../Button/Button.jsx";

const Footer = (props) => {
    const {onCustomOrder} = props;

    return (
        <footer className={styles.footer}>
            {onCustomOrder && (
                <section className={`container ${styles.cta}`}>
                    <div>
                        <h2>Не нашли то, что искали?</h2>
                        <p>
                            Сделаем зеркало, вазу или панно по вашему эскизу, размерам и цветам.
                            Опишите идею — мы свяжемся и обсудим детали.
                        </p>
                    </div>
                    <Button variant="accent" className={styles.ctaButton} onClick={onCustomOrder}>
                        Оставить заявку
                    </Button>
                </section>
            )}
            <div className={styles.bottom}>
                <div className={`container ${styles.bottomInner}`}>
                    <p>Изделия ручной работы. Оттенки и рисунок могут немного отличаться от фото — в этом их уникальность.</p>
                    <SocialLinks/>
                </div>
                <p className={`container ${styles.copy}`}>© {new Date().getFullYear()}</p>
            </div>
        </footer>
    );
};

export default Footer;
