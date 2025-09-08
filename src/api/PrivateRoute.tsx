import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode; // <- mais genérico que JSX.Element
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = localStorage.getItem('token'); // verifica se o JWT existe
  return token ? <>{children}</> : <Navigate to="/streamer/dashboard/login" replace />;
};

export default PrivateRoute;
