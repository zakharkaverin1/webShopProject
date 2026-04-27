import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import AddForm from "../components/AddForm/AddForm.jsx";
import DeleteForm from "../components/DeleteForm/DeleteForm.jsx";
import { verifyAdmin } from "../api/api.js";
import styles from './adminPage.module.scss';

const AdminPage = () => {
    const { password } = useParams();
    const [isLogged, setIsLogged] = useState(null);

    useEffect(() => {
        if (!password) {
            setIsLogged(false);
            return;
        }
        verifyAdmin(password)
            .then(data => {
                setIsLogged(data.success === true);
            });
    }, [password]);
    if (!isLogged) {
        return <div className={styles.accessDenied}>Отказано в доступе</div>;
    }
    return (
        <div className={styles.container}>
            <div className={styles.formsContainer}>
                <div className={styles.formColumn}>
                    <AddForm />
                </div>
                <div className={styles.formColumn}>
                    <DeleteForm />
                </div>
            </div>
        </div>
    );
};

export default AdminPage;