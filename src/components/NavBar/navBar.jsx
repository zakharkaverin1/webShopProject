import styles from "./navBar.module.scss";
import Button from "../Button/Button.jsx";
import Field from "../Field/Field.jsx";

const NavBar = () => {
    return (

        <div className={styles.navBar}>
            <Field
            placeholder="Поиск по названию"
            />
            <Button
            className={styles.search}
            children='Поиск'
            onClick={() => {}} //заглушка пока что
            ></Button>
        </div>
    )
}
export default NavBar