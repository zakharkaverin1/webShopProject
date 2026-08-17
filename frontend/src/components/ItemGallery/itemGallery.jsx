import styles from './itemGallery.module.scss'
import ItemCard from "../ItemCard/itemCard.jsx";
import AddForm from "../AddForm/AddForm.jsx";

const ItemGallery = (props) => {
    const {items, isAdmin, updateItems} = props;

    return (
        <div className={styles.ItemGallery}>
            {isAdmin && (
                <AddForm updateItems={updateItems}></AddForm>
            )}
            {items.map(item => (
                <ItemCard
                    key={item.id}
                    id={item.id}
                    price={item.price}
                    title={item.title}
                    description={item.description}
                    image={item.images[0]}
                    isAdmin={isAdmin}
                    updateItems={updateItems}
                />
            ))}
        </div>
    )
}

export default ItemGallery