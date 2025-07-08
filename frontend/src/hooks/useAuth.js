import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/verify-token', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setUser(data.user);
      } else {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error('Error verificando token:', error);
      localStorage.removeItem('token');
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((token) => {
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    checkAuth();
    toast.success('Sesión iniciada correctamente');
  }, [checkAuth]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    toast.info('Sesión cerrada');
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return { 
    isAuthenticated, 
    user, 
    isLoading, 
    login, 
    logout, 
    checkAuth 
  };
};

export default useAuth;