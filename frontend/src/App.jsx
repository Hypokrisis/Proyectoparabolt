import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";
import LoginForm from "./components/auth/LoginForm";
import DashboardLayout from "./components/DashboardLayout";
import UsersPage from "./pages/UsersPage";
import MetricsPage from "./pages/MetricsPage";
import ConfigPage from "./pages/ConfigPage";
import ClassesPage from "./pages/ClassesPage";
import PaymentsPage from "./pages/PaymentsPage";
import ReportsPage from "./pages/ReportsPage";
import NotFoundPage from "./pages/NotFoundPage";
import { useEffect } from "react";
import useAuth from "./hooks/useAuth";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Componente para rutas protegidas
const ProtectedRoute = ({ redirectPath = '/login' }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Outlet />;
};

function App() {
  const { theme } = useTheme();
  const { checkAuth } = useAuth();

  // Verificar autenticación al cargar la app
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<LoginForm />} />
          
          {/* Rutas protegidas */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<Navigate to="users" replace />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="metrics" element={<MetricsPage />} />
              <Route path="classes" element={<ClassesPage />} />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="config" element={<ConfigPage />} />
            </Route>
          </Route>

          {/* Redirecciones y 404 */}
          <Route path="/" element={<Navigate to="/dashboard/users" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>

      {/* Configuración de notificaciones Toast */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
    </div>
  );
}

export default App;