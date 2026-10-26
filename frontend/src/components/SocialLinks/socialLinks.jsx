import styles from "./socialLinks.module.scss";


const SocialLinks = () => {
    return (
        <div className={styles.listContainer}>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                <img className={styles.logo} src="/assets/img.png" alt="Telegram" width="46" height="46" loading="lazy"/>
            </a>
            <a href="#" target="_blank" rel="noopener noreferrer" aria-label="Соцсеть">
                <img className={styles.logo} src="/assets/img_1.png" alt="Соцсеть" width="46" height="46" loading="lazy"/>
            </a>
        </div>
    )
}

export default SocialLinks