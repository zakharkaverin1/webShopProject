import styles from "./socialLinks.module.scss";


const SocialLinks = () => {
    return (
        <div className={styles.listContainer}>
            <a href="#"><img className={styles.logo} src="/assets/img.png" alt="tg"/></a>
            <a><img className={styles.logo} src="/assets/img_1.png" alt="f"/></a>
        </div>
    )
}

export default SocialLinks