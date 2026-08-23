import { useState } from "react";
import styles from "./Carousel.module.scss";
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

const Carousel = (props) => {
    const { images } = props;
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return <div>Нет фотографий</div>;
    }

    const moreThanOneImage = images.length > 1;

    const next = () => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

    const prev = () => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    return (
        <div className={styles.carousel}>
            <Zoom
                zoomMargin={40}
                canSwipeToUnzoom={true}
            >
                <img
                    src={images[currentIndex]}
                    alt={`Foto ${currentIndex + 1}`}
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block'
                    }}
                />
            </Zoom>
            {moreThanOneImage && (
                <>
                    <button onClick={prev} className={styles.prev}>←</button>
                    <button onClick={next} className={styles.next}>→</button>
                </>
            )}
        </div>
    );
};

export default Carousel;