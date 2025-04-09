import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import Spinner from '../ui/Spinner';

const ExaminerRoute = () => {
  const { isAuthenticated, user, loading } = useContext(AuthContext);

  if (loading) {
    return <Spinner />;
  }

  return isAuthenticated && (user?.role === 'Admin' || user?.role === 'Examiner') ? (
    <Outlet />
  ) : (
    <Navigate to="/dashboard" />
  );
};

export default ExaminerRoute;