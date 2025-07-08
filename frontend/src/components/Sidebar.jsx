// src/components/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { 
  FiUsers, 
  FiActivity, 
  FiSettings, 
  FiHome,
  FiCalendar,
  FiDollarSign,
  FiUserPlus,
  FiPieChart,
  FiFileText
} from 'react-icons/fi';

const Sidebar = ({ darkMode, collapsed }) => {
  const { pathname } = useLocation();
  
  const menuItems = [
    {
      title: "Dashboard",
      icon: <FiHome className="text-lg" />,
      path: "/dashboard",
      match: "/dashboard$"
    },
    {
      title: "Usuarios",
      icon: <FiUsers className="text-lg" />,
      path: "/dashboard/users",
      match: "/users"
    },
    {
      title: "Métricas",
      icon: <FiActivity className="text-lg" />,
      path: "/dashboard/metrics",
      match: "/metrics"
    },
    {
      title: "Clases",
      icon: <FiCalendar className="text-lg" />,
      path: "/dashboard/classes",
      match: "/classes"
    },
    {
      title: "Pagos",
      icon: <FiDollarSign className="text-lg" />,
      path: "/dashboard/payments",
      match: "/payments"
    },
    {
      title: "Inscripciones",
      icon: <FiUserPlus className="text-lg" />,
      path: "/dashboard/enrollments",
      match: "/enrollments"
    },
    {
      title: "Reportes",
      icon: <FiPieChart className="text-lg" />,
      path: "/dashboard/reports",
      match: "/reports"
    },
    {
      title: "Configuración",
      icon: <FiSettings className="text-lg" />,
      path: "/dashboard/config",
      match: "/config"
    }
  ];

  return (
    <aside 
      className={`${collapsed ? 'w-20' : 'w-64'} min-h-screen sticky top-0 transition-all duration-300 ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      } border-r`}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} mb-8 p-2`}>
          {!collapsed && (
            <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
              <span>GYM</span>
              <span className="text-blue-600">PRO</span>
            </h2>
          )}
          {collapsed && (
            <div className="text-blue-600 font-bold text-xl">G</div>
          )}
        </div>

        {/* Menú */}
        <nav className="flex-1">
          <ul className="space-y-1">
            {menuItems.map((item) => {
              const isActive = new RegExp(item.match).test(pathname);
              return (
                <li key={item.title}>
                  <Link
                    to={item.path}
                    className={`flex items-center ${collapsed ? 'justify-center p-3' : 'p-3 pl-4'} rounded-lg transition-colors ${
                      isActive
                        ? darkMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-50 text-blue-600'
                        : darkMode
                        ? 'hover:bg-gray-700 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className={`${isActive ? 'opacity-100' : 'opacity-70'}`}>
                      {item.icon}
                    </span>
                    {!collapsed && (
                      <span className="ml-3 font-medium">{item.title}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer del Sidebar */}
        {!collapsed && (
          <div className={`mt-auto p-3 rounded-lg ${
            darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            <p className="text-sm">Versión 2.0.1</p>
            <p className="text-xs mt-1">© 2023 GymPro</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;