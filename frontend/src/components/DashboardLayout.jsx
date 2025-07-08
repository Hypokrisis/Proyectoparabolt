// src/components/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import Footer from './Footer';

const DashboardLayout = ({ children, activeSection }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [user] = useState({
    name: 'Admin Gimnasio',
    email: 'admin@gymfit.com',
    avatar: 'https://ui-avatars.com/api/?name=Gym+Fit&background=4f46e5&color=fff'
  });

  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className={`flex min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar - Ahora manejado como componente separado */}
      <Sidebar 
        activeSection={activeSection}
        collapsed={sidebarCollapsed}
        darkMode={darkMode}
        user={user}
      />
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header - Componente separado para mejor organización */}
        <TopHeader 
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          toggleSidebar={toggleSidebar}
          sidebarCollapsed={sidebarCollapsed}
          user={user}
        />
        
        {/* Main Content */}
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 transition-all duration-300 ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="max-w-7xl mx-auto">
            {/* Breadcrumb opcional */}
            <div className={`mb-6 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Dashboard / {activeSection}
            </div>
            {/* Aquí se renderizan las páginas hijas */}
            <Outlet />
          </div>
        </main>
        
        {/* Footer - Componente separado */}
        <Footer darkMode={darkMode} />
      </div>
    </div>
  );
};

export default DashboardLayout;