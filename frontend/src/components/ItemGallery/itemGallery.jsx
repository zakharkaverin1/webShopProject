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
                    price={item.price}
                    title={item.title}
                    image={item.images[0]}
                />
            ))}
        </div>
    )
}

export default ItemGallery