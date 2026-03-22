import {useState} from "react";

const Carousel = (props) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const {images} = props;
    if (!images || images.length === 0) {
        return <div>Нет фотографий</div>;
    }
    const moreThanOneImage = images.length > 1;
    const next = () =>{
        console.log(images[currentIndex])

        if (currentIndex === images.length-1){
            setCurrentIndex(0)
        }
        else{
            setCurrentIndex(currentIndex + 1)
        }
    }
    const prev = () =>{
        console.log(images[currentIndex])
        if (currentIndex === 0){
            setCurrentIndex(images.length - 1)
        }
        else{
            setCurrentIndex(currentIndex - 1)
        }
    }

    return (
        <div className="carousel">
            <img src={images[currentIndex]} alt={`Фото ${currentIndex + 1}`}/>
            {moreThanOneImage && (
                <>
                    <button onClick={prev}>←</button>
                    <button onClick={next}>→</button>
                </>
            )}
        </div>
    );
}

export default Carousel