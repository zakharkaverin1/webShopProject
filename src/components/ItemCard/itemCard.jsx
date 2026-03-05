import styles from './itemCard.module.scss'

const ItemCard = (props) => {
    const {
        id,
        title,
        image
    } = props

    return (
        <div
            className={styles.itemCard}>
            <img src={image} alt={title}/>
            <h2 id={id}>{title}</h2>
        </div>

    )
}

export default ItemCard