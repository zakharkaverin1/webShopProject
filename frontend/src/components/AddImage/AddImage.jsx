import React from 'react';

const AddImage = (props) => {
    const {
        name,
        onChange,
    } = props;

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        onChange && onChange(files);
    };

    return (
        <input
            type="file"
            accept="image/*"
            multiple
            name={name}
            onChange={handleFileChange}
        />
    );
};

export default AddImage;