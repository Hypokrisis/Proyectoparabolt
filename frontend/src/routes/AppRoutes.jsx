// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import AuthRoute from '../components/auth/AuthRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import UsersPage from '../pages/Dashboard/UsersPage';
import MetricsPage from '../pages/Dashboard/MetricsPage';
import AdminPanel from '../pages/Dashboard/AdminPanel';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rutas públicas */}
      <Route path="/login" element={<LoginPage />} />
      
      {/* Rutas protegidas */}
      <Route element={<AuthRoute />}>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<HomePage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="metrics" element={<MetricsPage />} />
        </Route>
      </Route>

      {/* Rutas con roles específicos */}
      <Route element={<AuthRoute roles={['admin', 'superadmin']} />}>
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminPanel />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Route>

      {/* Otras rutas */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default AppRoutes;