import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = !!localStorage.getItem('token'); // Check if user is logged in
  return isLoggedIn ? children : <Navigate to="/" replace />;
};

export default ProtectedRoute;