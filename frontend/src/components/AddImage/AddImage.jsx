import React, {useEffect, useRef} from 'react';

const AddImage = (props) => {
    const {
        name,
        onChange,
        resetKey
    } = props;
    const inputRef = useRef(null);

    useEffect(() => {
        if (inputRef.current && resetKey !== undefined) {
            inputRef.current.value = '';
        }
    }, [resetKey]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        onChange && onChange(files);
    }

    return (
        <input
            type="file"
            accept="image/*"
            multiple
            name={name}
            onChange={handleFileChange}
            ref={inputRef}
        />
    );
};

export default AddImage;