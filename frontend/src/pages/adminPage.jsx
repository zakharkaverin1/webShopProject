import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminPage = () => {
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetch('/api/check-admin', {
            credentials: 'include'
        })
            .then(res => {
                if (res.ok) {
                    navigate('/');
                }
            })
            .catch(() => {});
    }, [navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(`/api/verify-admin`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
            credentials: 'include',
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    navigate('/');
                } else {
                    alert("Неверный пароль");
                }
            }).catch(error => {
            console.error('Ошибка:', error);
            alert("Произошла ошибка при входе");
        });
    };

    return (
        <form onSubmit={handleSubmit}>
        <input
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Войти как админ</button>
    </form>);
};

export default AdminPage;