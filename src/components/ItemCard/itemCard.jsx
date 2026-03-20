import styles from './itemCard.module.scss'
import {Link} from "react-router-dom";

const ItemCard = (props) => {
    const {
        id,
        title,
        price,
        image
    } = props

    return (
        <Link to={`/item/${id}`}>
            <div className={styles.itemCard}>
                <img src={image} alt={title} />
                <div className={styles.cardContent}>
                    <h2>{title}</h2>
                    <p className={styles.price}>${price}</p>
                </div>
            </div>
        </Link>
    )
}

export default ItemCard