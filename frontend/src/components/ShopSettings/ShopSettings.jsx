import { useEffect, useState } from "react";
import Button from "../Button/Button.jsx";
import { getShopSettings } from "../../api/api.js";

const fonts = [
    { name: "Poppins", value: "Poppins, sans-serif" },
    { name: "Arial", value: "Arial, sans-serif" },
    { name: "Georgia", value: "Georgia, serif" },
    { name: "Times New Roman", value: "'Times New Roman', serif" },
    { name: "Verdana", value: "Verdana, sans-serif" },
    { name: "Courier New", value: "'Courier New', monospace" }
];

const ShopSettings = ({ shopName, onSave, onClose }) => {
    const [formData, setFormData] = useState({
        shopName: shopName || "",
        titleColor: "#38342F",
        font: "Poppins, sans-serif"
    });

    useEffect(() => {
        getShopSettings()
            .then(data => {
                setFormData({
                    shopName: data.shopName || shopName || "",
                    titleColor: data.titleColor || "#38342F",
                    font: data.font || "Poppins, sans-serif"
                });
            })
            .catch(() => {});
    }, [shopName]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = () => {
        if (!formData.shopName.trim()) {
            alert("Название магазина не может быть пустым");
            return;
        }

        onSave({
            shopName: formData.shopName.trim(),
            titleColor: formData.titleColor,
            font: formData.font
        });
    };

    return (
        <div>
            <h3>Настройки магазина</h3>

            <label>
                Название магазина
                <input
                    type="text"
                    name="shopName"
                    value={formData.shopName}
                    onChange={handleChange}
                />
            </label>

            <label>
                Цвет заголовка
                <input
                    type="color"
                    name="titleColor"
                    value={formData.titleColor}
                    onChange={handleChange}
                />
            </label>

            <label>
                Шрифт
                <select
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

            <Button onClick={handleSubmit}>
                Сохранить
            </Button>

            <Button onClick={onClose}>
                Отмена
            </Button>
        </div>
    );
};

export default ShopSettings;
