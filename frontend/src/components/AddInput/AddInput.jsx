import React from 'react';


const AddInput = (props) => {
    const {
        placeholder,
        name,
        value,
        onChange,
        type = 'text'
    } = props;
    if (type === 'textarea') {
        return (
            <textarea
                autoComplete="off"
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange && onChange(e.target.value)}
            />
        );
    }

    return (
        <input
            type={type}
            placeholder={placeholder}
            name={name}
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
        />
    );
};

export default AddInput;