import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const userString = localStorage.getItem("user");
    let user = null;
    
    try {
        user = JSON.parse(userString);
    } catch (e) {
        user = null;
    }

    if (user && user.role === 'admin') {
        return <Outlet />;
    }

    alert("Bạn không có quyền truy cập trang này!");
    return <Navigate to="/login" replace />;
};

export default AdminRoute;
