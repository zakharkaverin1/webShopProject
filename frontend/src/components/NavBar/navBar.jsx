import { useState } from "react";
import styles from "./navBar.module.scss";
import Button from "../Button/Button.jsx";
import Field from "../Field/Field.jsx";
import SocialLinks from "../SocialLinks/socialLinks.jsx";

const NavBar = (props) => {
    const {onSearch} = props;
    const [localSearch, setLocalSearch] = useState("");

    return (
        <div className={styles.navBar}>
            <Field
                placeholder="Поиск по названию"
                value={localSearch}
                onChange={(i) => setLocalSearch(i.target.value)}
            />
            <Button
                className={styles.search}
                children='Поиск'
                onClick={() => onSearch(localSearch)}
            />
            <SocialLinks></SocialLinks>
        </div>
    )
}

export default NavBar;