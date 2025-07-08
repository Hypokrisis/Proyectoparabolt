import { useState } from 'react';
import UploadLogo from '../components/UploadLogo';
import AdminPanel from '../components/AdminPanel';
import { FiSettings, FiImage, FiUsers, FiShield } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import SectionCard from '../context/SectionCard';

const ConfigPage = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('branding');

  const tabs = [
    { id: 'branding', label: 'Branding', icon: <FiImage /> },
    { id: 'users', label: 'Usuarios', icon: <FiUsers /> },
    { id: 'security', label: 'Seguridad', icon: <FiShield /> },
    { id: 'advanced', label: 'Avanzado', icon: <FiSettings /> }
  ];

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Configuración del Gimnasio
          </h1>
        </div>

        {/* Tabs Navigation */}
        <div className={`mb-8 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 font-medium text-sm flex items-center border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? theme === 'dark'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-blue-600 text-blue-600'
                    : theme === 'dark'
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <SectionCard title="Personalización de marca" className="mb-6">
              {activeTab === 'branding' && <UploadLogo />}
              {activeTab === 'users' && <div>Configuración de usuarios...</div>}
              {activeTab === 'security' && <div>Opciones de seguridad...</div>}
              {activeTab === 'advanced' && <AdminPanel />}
            </SectionCard>
          </div>

          <div className="lg:col-span-1">
            <SectionCard title="Guía rápida">
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                <p className="mb-3">
                  <strong>Branding:</strong> Sube el logo de tu gimnasio y personaliza los colores.
                </p>
                <p className="mb-3">
                  <strong>Usuarios:</strong> Gestiona permisos y roles del personal.
                </p>
                <p className="mb-3">
                  <strong>Seguridad:</strong> Configura contraseñas y accesos.
                </p>
                <p>
                  <strong>Avanzado:</strong> Configuraciones para administradores.
                </p>
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;