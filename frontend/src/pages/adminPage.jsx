
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkAdmin, verifyAdmin } from "../api/api.js";
import Button from "../components/Button/Button.jsx";
import { useShopSettings } from "../utils/shopSettings.js";
import { useDocumentMeta } from "../utils/useDocumentMeta.js";
import styles from "./pages.module.scss";

const AdminPage = () => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const shopName = useShopSettings()?.shopName;
    useDocumentMeta(shopName && `Вход для администратора | ${shopName}`, null, {noindex: true}); // [SEO] страница входа не индексируется

    useEffect(() => {
        checkAdmin().then(isAdmin => {
            if (isAdmin) navigate('/');
        });
    }, [navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!password) {
            setError("Введите пароль");
            return;
        }
        setIsSubmitting(true);
        setError('');
        verifyAdmin(password)
            .then(() => navigate('/'))
            .catch(err => {
                // сообщение о блокировке после частых попыток приходит с сервера по-русски [БЕЗОП]
                setError(err.message === 'Incorrect password'
                    ? "Неверный пароль"
                    : err.message.startsWith('Слишком много') // [БЕЗОП] лимит попыток входа
                        ? err.message // [БЕЗОП]
                        : "Произошла ошибка при входе");
            })
            .finally(() => setIsSubmitting(false));
    };

    return (
        <div className={styles.loginPage}>
            <form className={styles.loginForm} onSubmit={handleSubmit}>
                <h1>Вход для администратора</h1>
                {/* [БЕЗОП] autoComplete="current-password" — пароль подставляет менеджер паролей */}
                <input
                    className="input"
                    type="password"
                    placeholder="Введите пароль"
                    autoComplete="current-password"
                    autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className={styles.loginError}>{error}</p>}
                <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Вход...' : 'Войти'}
                </Button>
                <Link to="/" className={styles.backLink} style={{margin: '0 auto'}}>← На главную</Link>
            </form>
        </div>
    );
};

export default AdminPage;
