import {useState} from "react";
import styles from "./Carousel.module.scss";
import Modal from "../Modal/modal.jsx";

const Carousel = (props) => {
    const {images} = props;
    const [currentIndex, setCurrentIndex] = useState(0);
    //  const [currentModalIndex, setCurrentModalIndex] = useState(0);
    // const [isZoomed, setIsZoomed] = useState(false);
    // const toggleZoom = () => setIsZoomed(!isZoomed);
    //  const [openModal, setOpenModal] = useState(false);


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

    { /* const nextModal = () => {
        setCurrentModalIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    };

     const prevModal = () => {
        setCurrentModalIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    };

    const handleImageClick = () => {
        setCurrentModalIndex(currentIndex)
        setOpenModal(true);
    };

     const handleModalClose = () => {
        setOpenModal(false);
        setIsZoomed(false);
    } */}

    return (
        <>
            { /* <Modal isOpen={openModal}
               onClose={() => handleModalClose()}>
            <div className={styles.modalCarousel }>
                <img
                    src={images[currentModalIndex]}
                    alt={`Foto ${currentModalIndex + 1}`}
                    className={isZoomed ? styles.zoomed : ''}
                    onClick={toggleZoom}
                />
                {moreThanOneImage && (
                    <>
                        <button onClick={prevModal}>←</button>
                        <button onClick={nextModal}>→</button>
                    </>
                )}
            </div>

        </Modal>*/}
            <div className={styles.carousel}>
                <img
                    src={images[currentIndex]}
                    alt={`Foto ${currentIndex + 1}`}
                    // onClick={handleImageClick}
                />
                {moreThanOneImage && (
                    <>
                        <button onClick={prev}>←</button>
                        <button onClick={next}>→</button>
                    </>
                )}
            </div>
        </>
    );
};

export default Carousel;