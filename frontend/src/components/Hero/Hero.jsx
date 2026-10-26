import styles from './Hero.module.scss';
import Button from "../Button/Button.jsx";

const Hero = (props) => {
    const {onCustomOrder} = props;

    const scrollToCatalog = () => {
        document.getElementById('catalog')?.scrollIntoView({behavior: 'smooth'});
    };

    return (
        <section className={styles.hero}>
            <div className={`container ${styles.inner}`}>
                <span className={styles.eyebrow}>Декор ручной работы</span>
                <h1 className={styles.title}>Вещи с характером для вашего дома</h1>
                <p className={styles.subtitle}>
                    Зеркала, вазы, панно и другие предметы интерьера, сделанные руками
                    из натуральных материалов.
                </p>
                <div className={styles.actions}>
                    <Button variant="accent" className={styles.cta} onClick={scrollToCatalog}>
                        Смотреть каталог
                    </Button>
                    <button className={`${styles.cta} ${styles.outline}`} onClick={onCustomOrder}>
                        Индивидуальный заказ
                    </button>
                </div>
            </div>
        </section>
    );
};

export default Hero;
