import React from 'react';
import { useParams } from 'react-router-dom';
import Button from "../components/Button/Button.jsx";
import styles from "../components/NavBar/navBar.module.scss";

const AdminPage = () => {
    const { password } = useParams();
    if (password!=="123") {
        return (<p>Отказано в доступе</p>)
    }

    return (
        <div>
            <Button
                children='Добавить новый товар'
                onClick={() => {return 0}}
            />
            <Button
                    children='Удалить товар'
            onClick={() => {return 0}}
            />
            <Button
                children='Редактировать товар'
                onClick={() => {return 0}}
            />
        </div>
    );
};

export default AdminPage;