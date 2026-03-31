import styles from "./socialLinks.module.scss";


const SocialLinks = () => {
    return (
        <div className={styles.listContainer}>
            <a href="#"><img className={styles.logo} src="/images/img_4.png" alt="tg"/></a>
            <a><img className={styles.logo} src="/images/img_3.png" alt="f"/></a>
        </div>
    )
}

export default SocialLinks