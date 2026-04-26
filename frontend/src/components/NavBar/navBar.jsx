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
            <div className={styles.topRow}>
                <img className={styles.logo} src="/assets/KenigArtikLogo.png" alt="logo"/>
            </div>

            <div className={styles.bottomRow}>
                <div className={styles.searchContainer}>
                    <Field
                        className={styles.field}
                        placeholder="Поиск по названию"
                        value={localSearch}
                        onChange={(i) => setLocalSearch(i.target.value)}
                    />
                    <Button
                        className={styles.searchButton}
                        onClick={() => onSearch(localSearch)}
                    >
                        🔍
                    </Button>
                </div>
                <SocialLinks />
            </div>
        </div>
    )
}

export default NavBar;