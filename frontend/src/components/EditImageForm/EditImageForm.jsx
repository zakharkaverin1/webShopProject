import { useEffect, useState } from "react";
import { getItem, uploadImages, replaceItemImage, deleteItemImage } from "../../api/api.js";
import styles from "./EditImageForm.module.scss";
import Button from "../Button/Button.jsx";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

const EditImageForm = (props) => {
    const { id } = props;
    const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        getItem(id)
            .then((item) => {
                if (!cancelled) setImages(Array.isArray(item?.images) ? item.images : []);
            })
            .catch((error) => {
                if (!cancelled) alert(`Ошибка загрузки фото: ${error.message}`);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    const handleAddImage = (event) => {
        const input = event.target;
        const files = Array.from(input.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        uploadImages(id, files)
            .then((data) => setImages(data.images || []))
            .catch((error) => alert(`Не удалось загрузить изображения: ${error.message}`))
            .finally(() => {
                setIsUploading(false);
                input.value = '';
            });
    };

    const handleReplaceImage = (index) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = ACCEPT;
        input.onchange = () => {
            const file = input.files?.[0];
            if (!file) return;
            setIsUploading(true);
            replaceItemImage(id, file, index)
                .then((data) => {
                    setImages((prevImages) => {
                        const newImages = [...prevImages];
                        newImages[index] = data.new_image;
                        return newImages;
                    });
                })
                .catch((error) => alert(`Не удалось заменить: ${error.message}`))
                .finally(() => setIsUploading(false));
        };

        input.click();
    };

    const handleDeleteImage = (index) => {
        if (images.length <= 1) {
            alert('Нельзя удалить последнее изображение');
            return;
        }

        if (!window.confirm(`Удалить изображение ${index + 1}?`)) {
            return;
        }

        setIsUploading(true);
        deleteItemImage(id, index)
            .then(() => {
                setImages((prevImages) => prevImages.filter((_, i) => i !== index));
            })
            .catch((error) => alert(`Не удалось удалить изображение: ${error.message}`))
            .finally(() => setIsUploading(false));
    };

    return (
        <div className={styles.grid}>
            <label className={`${styles.addButton} ${isUploading ? styles.disabled : ''}`}>
                <input
                    type="file"
                    accept={ACCEPT}
                    multiple
                    onChange={handleAddImage}
                    disabled={isUploading}
                />
                <span className={styles.addIcon}>+</span>
                <span className={styles.addText}>
                    {isUploading ? 'Загрузка...' : 'Добавить'}
                </span>
            </label>

            {images.map((imagePath, index) => (
                <div className={styles.item} key={imagePath}>
                    <img
                        src={imagePath}
                        alt={`Изображение ${index + 1}`}
                        className={styles.image}
                    />
                    {index === 0 && <span className={styles.badge}>Обложка</span>}
                    <div className={styles.itemActions}>
                        <Button
                            variant="secondary"
                            onClick={() => handleReplaceImage(index)}
                            disabled={isUploading}
                        >
                            Заменить
                        </Button>
                        <Button
                            variant="danger"
                            onClick={() => handleDeleteImage(index)}
                            disabled={isUploading || images.length <= 1}
                        >
                            ✕
                        </Button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default EditImageForm;
