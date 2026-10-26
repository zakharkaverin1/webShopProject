import { useState } from "react";
import Button from "../Button/Button.jsx";
import styles from "./ShopSettings.module.scss";
import {DEFAULT_SETTINGS} from "../../utils/shopSettings.js";

const fonts = [
    { name: "Cormorant Garamond", value: "'Cormorant Garamond', serif" },
    { name: "Manrope", value: "'Manrope', sans-serif" },
    { name: "Poppins", value: "Poppins, sans-serif" },
    { name: "Arial", value: "Arial, sans-serif" },
    { name: "Georgia", value: "Georgia, serif" },
    { name: "Times New Roman", value: "'Times New Roman', serif" },
    { name: "Verdana", value: "Verdana, sans-serif" },
    { name: "Courier New", value: "'Courier New', monospace" }
];

const ShopSettings = ({ settings, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        shopName: settings.shopName || "",
        titleColor: settings.titleColor || DEFAULT_SETTINGS.titleColor,
        font: settings.font || DEFAULT_SETTINGS.font
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.shopName.trim()) {
            alert("Название магазина не может быть пустым");
            return;
        }

        setIsSaving(true);
        Promise.resolve(onSave({
            shopName: formData.shopName.trim(),
            titleColor: formData.titleColor,
            font: formData.font
        })).finally(() => setIsSaving(false));
    };

    return (
        <form className={styles.settings} onSubmit={handleSubmit}>
            <h3>Настройки магазина</h3>

            <div
                className={styles.preview}
                style={{color: formData.titleColor, fontFamily: formData.font}}
            >
                {formData.shopName || "Название"}
            </div>

            <label className="label">
                Название магазина
                <input
                    className="input"
                    type="text"
                    name="shopName"
                    maxLength={60}
                    value={formData.shopName}
                    onChange={handleChange}
                />
            </label>

            <div className={styles.row}>
                <label className="label">
                    Цвет заголовка
                    <input
                        className={styles.colorInput}
                        type="color"
                        name="titleColor"
                        value={formData.titleColor}
                        onChange={handleChange}
                    />
                </label>

                <label className="label">
                    Шрифт
                    <select
                        className="select"
                        name="font"
                        value={formData.font}
                        onChange={handleChange}
                    >
                        {fonts.map(font => (
                            <option key={font.value} value={font.value}>
                                {font.name}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            <div className={styles.actions}>
                <Button variant="secondary" onClick={onClose} disabled={isSaving}>
                    Отмена
                </Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                </Button>
            </div>
        </form>
    );
};

export default ShopSettings;
