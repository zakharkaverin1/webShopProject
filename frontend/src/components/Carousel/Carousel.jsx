import { useRef, useState } from "react";
import styles from "./Carousel.module.scss";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';
import Placeholder from "../Placeholder/Placeholder.jsx";

const SWIPE_THRESHOLD = 50;

const Carousel = (props) => {
    const { images, seed, title } = props;
    const [currentIndex, setCurrentIndex] = useState(0);
    const touchStartX = useRef(null);

    if (!images || images.length === 0) {
        return (
            <div className={styles.carousel}>
                <Placeholder seed={seed}/>
            </div>
        );
    }

    const moreThanOneImage = images.length > 1;
    const index = Math.min(currentIndex, images.length - 1);

    const next = () => {
        setCurrentIndex(index === images.length - 1 ? 0 : index + 1);
    };

    const prev = () => {
        setCurrentIndex(index === 0 ? images.length - 1 : index - 1);
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === null || !moreThanOneImage) return;
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (diff > SWIPE_THRESHOLD) prev();
        if (diff < -SWIPE_THRESHOLD) next();
        touchStartX.current = null;
    };

    return (
        <div
            className={styles.carousel}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
        >
            <Zoom
                zoomMargin={40}
                canSwipeToUnzoom={true}
            >
                <img
                    src={images[index]}
                    alt={title ? `${title} — фото ${index + 1}` : `Фото ${index + 1}`}
                    fetchPriority={index === 0 ? "high" : undefined}
                />
            </Zoom>
            {moreThanOneImage && (
                <>
                    <button onClick={prev} className={styles.prev} aria-label="Предыдущее фото">←</button>
                    <button onClick={next} className={styles.next} aria-label="Следующее фото">→</button>
                    <div className={styles.dots}>
                        {images.map((image, i) => (
                            <span
                                key={image + i}
                                className={`${styles.dot} ${i === index ? styles.activeDot : ''}`}
                                onClick={() => setCurrentIndex(i)}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Carousel;
