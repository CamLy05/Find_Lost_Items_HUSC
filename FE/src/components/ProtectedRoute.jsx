import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AppContext.jsx';

const ProtectedRoute = ({ children, requiredRole }) => {
    const { isAuthenticated, userRole } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (requiredRole && userRole !== requiredRole) {
        // Redirect to appropriate dashboard based on role
        if (userRole === 'admin') {
            return <Navigate to="/admin-dashboard" replace />;
        }
        return <Navigate to="/student-dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;