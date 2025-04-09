import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import Spinner from '../ui/Spinner';

const AdminRoute = () => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return <Spinner />;
  }

  return isAuthenticated && user?.role === 'Admin' ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" />
  );
};

export default AdminRoute;