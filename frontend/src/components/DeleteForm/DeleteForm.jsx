import React, {useState} from 'react';
import AddInput from "../AddInput/AddInput.jsx";
import Button from "../Button/Button.jsx";
import AddImage from "../AddImage/AddImage.jsx";

const DeleteForm = () => {
    const [formData, setFormData] = useState({
        itemTitle: '',
        itemPrice: '',
        itemDescription: '',
        itemImages: []
    });

}

export default DeleteForm;