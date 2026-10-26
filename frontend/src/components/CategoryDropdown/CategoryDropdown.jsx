import {useEffect, useRef, useState} from "react";
import styles from "./CategoryDropdown.module.scss";

const CategoryDropdown = (props) => {
    const {categories, value, onChange} = props;
    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [open]);

    const current = categories.find(c => c.id === value);
    const options = [{id: null, name: "Все изделия"}, ...categories];

    const select = (id) => {
        onChange(id);
        setOpen(false);
    };

    return (
        <div className={styles.dropdown} ref={rootRef}>
            <button
                type="button"
                className={`${styles.trigger} ${open ? styles.open : ''}`}
                onClick={() => setOpen(prev => !prev)}
                aria-haspopup="listbox"
                aria-expanded={open}
            >
                <span className={styles.label}>Категория</span>
                <span className={styles.value}>{current ? current.name : "Все изделия"}</span>
                <span className={styles.chevron} aria-hidden="true">▾</span>
            </button>

            {open && (
                <ul className={styles.menu} role="listbox">
                    {options.map(option => (
                        <li key={option.id ?? 'all'}>
                            <button
                                type="button"
                                role="option"
                                aria-selected={option.id === (current?.id ?? null)}
                                className={`${styles.option} ${option.id === (current?.id ?? null) ? styles.active : ''}`}
                                onClick={() => select(option.id)}
                            >
                                {option.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CategoryDropdown;
