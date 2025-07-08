// src/hooks/useAuth.js
import { useState } from 'react';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));

  const login = (token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  const checkAuth = () => {
    setIsAuthenticated(!!localStorage.getItem('token'));
  };

  return { isAuthenticated, login, logout, checkAuth };
};

export default useAuth;