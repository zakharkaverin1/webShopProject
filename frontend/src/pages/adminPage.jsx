import React from 'react';
import { useParams } from 'react-router-dom';
import AddForm from "../components/AddForm/AddForm.jsx";
import DeleteForm from "../components/DeleteForm/DeleteForm.jsx";
import styles from './adminPage.module.scss';

const AdminPage = () => {
    const { password } = useParams();
    if (password !== import.meta.env.VITE_ADMIN_PASSWORD) {
        return (
            <div className={styles.accessDenied}>
                <p>Отказано в доступе</p>
            </div>
        );
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