import React, { createContext, useContext, useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { ApiConfig } from '../api/ApiConfig';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      const refreshToken = Cookies.get('refreshToken');

      if (token) {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }

      if (refreshToken) {
        try {
          const newToken = await ApiConfig.refreshToken(); // usa a função do ApiConfig
          if (newToken) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
          }
        } catch {
          setIsAuthenticated(false);
        } finally {
          setIsLoading(false);
        }
        return;
      }

      setIsAuthenticated(false);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
