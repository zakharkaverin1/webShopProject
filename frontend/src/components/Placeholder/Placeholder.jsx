import styles from './Placeholder.module.scss';
import {useShopSettings} from "../../utils/shopSettings.js";

const TONES = ['turquoise', 'orange', 'grey'];

const Placeholder = (props) => {
    const {seed = 0, text = 'Фото скоро появится', className = ''} = props;
    const tone = TONES[Math.abs(Number(seed) || 0) % TONES.length];
    const shopName = useShopSettings()?.shopName;

    return (
        <div className={`${styles.placeholder} ${styles[tone]} ${className}`}>
            {shopName && <span className={styles.brand} aria-hidden="true">{shopName}</span>}
            {text && <span className={styles.text}>{text}</span>}
        </div>
    );
};

export default Placeholder;
