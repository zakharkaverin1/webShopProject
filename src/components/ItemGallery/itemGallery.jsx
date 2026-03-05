import styles from './itemGallery.module.scss'
import ItemCard from "../ItemCard/itemCard.jsx";

const ItemGallery = (props) => {
    const {items} = props;

    return (
        <div className={styles.ItemGallery}>
            {items.map(item => (
                <ItemCard
                    key={item.id}
                    id={item.id}
                    title={item.title}
                    image={item.image}
                />
            ))}
        </div>

    )
}

export default ItemGallery