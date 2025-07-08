// src/components/auth/AuthRoute.jsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Outlet } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoadingSpinner from '../ui/LoadingSpinner';

const AuthRoute = ({ roles = [], redirectPath = '/login' }) => {
  const { isAuthenticated, user, isLoading } = useSelector(state => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      // Si no está autenticado, redirige al login
      if (!isAuthenticated) {
        toast.warning('Debes iniciar sesión para acceder a esta página');
        navigate(redirectPath);
        return;
      }

      // Si se especificaron roles y el usuario no tiene ninguno de ellos
      if (roles.length > 0 && !roles.includes(user?.role)) {
        toast.error('No tienes permisos para acceder a esta página');
        navigate('/unauthorized');
      }
    }
  }, [isAuthenticated, user, roles, isLoading, navigate, redirectPath]);

  // Mostrar spinner mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Si está autenticado y tiene los roles necesarios, renderizar el contenido
  return isAuthenticated && (roles.length === 0 || roles.includes(user?.role)) ? (
    <Outlet />
  ) : null;
};

export default AuthRoute;