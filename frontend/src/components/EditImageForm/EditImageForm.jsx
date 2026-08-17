import { useEffect, useState } from "react";
import { getImagesById } from "../../utils/functions.js";
import {uploadImages, replaceItemImage, deleteItemImage} from "../../api/api.js";
import styles from "./EditImageForm.module.scss";
import Button from "../Button/Button.jsx";

const EditImageForm = (props) => {
    const { id } = props;
    const [images, setImages] = useState([]);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (!id) {
            alert("ID не передан");
            return;
        }
        loadImages();
    }, [id]);

    const loadImages = () => {
        getImagesById(id)
            .then((imgData) => {
                if (Array.isArray(imgData) && imgData.length > 0) {
                    setImages(imgData);
                } else if (typeof imgData === 'string') {
                    setImages([imgData]);
                }
            })
            .catch((error) => {
                alert(`Ошибка загрузки ${error}` );
                setImages([]);
            });
    };

    const handleAddImage = (event) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        setIsUploading(true);

        uploadImages(id, files)
            .then((data) => {
                setImages(data.images || []);
                setIsUploading(false);
                event.target.value = '';
            })
            .catch((error) => {
                alert(`Не удалось загрузить изображения ${error}` );
                setIsUploading(false);
                event.target.value = '';
            });
    };

    const handleReplaceImage = (index) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (event) => {
            const files = event.target.files;
            if (!files || files.length === 0) return;
            const file = files[0];
            setIsUploading(true);
            replaceItemImage(id, file, index)
                .then((data) => {
                    setImages((prevImages) => {
                        const newImages = [...prevImages];
                        newImages[index] = data.new_image;
                        return newImages;
                    });
                    setIsUploading(false);
                })
                .catch((error) => {
                    alert(`Не удалось заменить: ${error.message}`);
                    setIsUploading(false);
                })
                .finally(() => {
                    event.target.value = '';
                });
        };

        input.click();
    };

    const handleDeleteImage = (index) => {
        const imageIndex = Number(index);

        if (images.length <= 1) {
            alert('Нельзя удалить последнее изображение');
            return;
        }

        if (!window.confirm(`Вы уверены, что хотите удалить изображение ${imageIndex + 1}?`)) {
            return;
        }

        setIsUploading(true);

        deleteItemImage(id, imageIndex)
            .then(() => {
                setImages((prevImages) => {
                    const newImages = [...prevImages];
                    newImages.splice(imageIndex, 1);
                    return newImages;
                });
                setIsUploading(false);
            })
            .catch((error) => {
                alert(`Не удалось удалить изображение: ${error.message}`);
                setIsUploading(false);
            });
    };



    return (
        <div className={styles.container}>
                <div className={styles.grid}>
                    <div className={styles.addButtonWrapper}>
                        <label className={styles.addButton}>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={handleAddImage}
                                disabled={isUploading}
                            />
                            <span className={styles.addIcon}>+</span>
                            <span className={styles.addText}>
                {isUploading ? 'Загрузка...' : 'Добавить'}
              </span>
                        </label>
                    </div>

                    {images.map((imagePath, index) => (
                        <div className={styles.internalContainer} key={index}>
                            <div className={styles.item}>
                                <img
                                    src={imagePath}
                                    alt={`Изображение ${index + 1}`}
                                    className={styles.image}
                                />
                            </div>

                            <div className={styles.internalButtons}>
                                    <Button className={styles.internalButton} onClick={() => handleReplaceImage(index)} // НОВАЯ СТРОКА (вызов)
                                            disabled={isUploading}>Заменить</Button>
                                    <Button className={styles.internalButton} onClick={() => handleDeleteImage(index)}>Удалить</Button>
                                </div>
                        </div>
                    ))}
                </div>
        </div>
    );
};

export default EditImageForm;