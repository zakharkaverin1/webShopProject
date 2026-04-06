import React from 'react';
import { useParams } from 'react-router-dom';
import AddForm from "../components/AddForm/AddForm.jsx";

const AdminPage = () => {
    const { password } = useParams();
    if (password!=="123") {
        return (<p>Отказано в доступе</p>)
    }

    return (
        <div>
            <AddForm></AddForm>
        </div>
    );
};

export default AdminPage;