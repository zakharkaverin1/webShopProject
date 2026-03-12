import styles from './itemCard.module.scss'

const ItemCard = (props) => {
    const {
        id,
        title,
        price,
        image
    } = props

    return (
        <div className={styles.itemCard}>
            <img src={image} alt={title} />
            <div className={styles.cardContent}>
                <h2>{title}</h2>
                <p className={styles.price}>${price}</p>
            </div>
        </div>

    )
}

export default ItemCard