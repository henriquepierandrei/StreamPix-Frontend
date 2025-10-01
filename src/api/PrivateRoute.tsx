import React from 'react';
import { Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const token = Cookies.get('token'); // verifica se o JWT existe no cookie
  return token ? <>{children}</> : <Navigate to="/streamer/dashboard/login" replace />;
};

export default PrivateRoute;