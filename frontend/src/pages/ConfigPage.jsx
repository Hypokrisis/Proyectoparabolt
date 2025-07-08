import { useState, useEffect } from 'react';
import { FiSettings, FiImage, FiPalette, FiSave, FiRefreshCw } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import UploadLogo from '../components/UploadLogo';
import { toast } from 'react-toastify';

const ConfigPage = () => {
  const { theme, updatePrimaryColor, primaryColor } = useTheme();
  const [config, setConfig] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('branding');

  const fetchConfig = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/config', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConfig(data);
      } else {
        toast.error('Error al cargar configuración');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const updateConfig = async (key, value) => {
    setSaving(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ key, value })
      });

      if (response.ok) {
        setConfig(prev => ({ ...prev, [key]: value }));
        toast.success('Configuración actualizada');
      } else {
        toast.error('Error al actualizar configuración');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setSaving(false);
    }
  };

  const colorPresets = [
    { name: 'Azul', value: '#3b82f6' },
    { name: 'Verde', value: '#10b981' },
    { name: 'Púrpura', value: '#8b5cf6' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Naranja', value: '#f59e0b' },
    { name: 'Rojo', value: '#ef4444' }
  ];

  const tabs = [
    { id: 'branding', label: 'Branding', icon: <FiImage /> },
    { id: 'appearance', label: 'Apariencia', icon: <FiPalette /> },
    { id: 'general', label: 'General', icon: <FiSettings /> }
  ];

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Configuración del Gimnasio
            </h1>
            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Personaliza la apariencia y configuración del sistema
            </p>
          </div>
          <button
            onClick={fetchConfig}
            className={`mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
              theme === 'dark' 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FiRefreshCw className="mr-2" /> Actualizar
          </button>
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
            {activeTab === 'branding' && (
              <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Personalización de Marca
                </h3>
                <UploadLogo onUploadSuccess={(url) => updateConfig('gym_logo', url)} />
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Configuración de Apariencia
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Color Principal
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {colorPresets.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => updatePrimaryColor(color.value)}
                          className={`flex items-center p-3 rounded-lg border-2 transition-all ${
                            primaryColor === color.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                              : theme === 'dark'
                              ? 'border-gray-600 hover:border-gray-500'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div
                            className="w-6 h-6 rounded-full mr-3"
                            style={{ backgroundColor: color.value }}
                          />
                          <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            {color.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Color Personalizado
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => updatePrimaryColor(e.target.value)}
                        className="w-12 h-12 rounded-lg border border-gray-300 cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => updatePrimaryColor(e.target.value)}
                        className={`flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                        }`}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'general' && (
              <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <h3 className={`text-lg font-medium mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                  Configuración General
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Nombre del Gimnasio
                    </label>
                    <input
                      type="text"
                      defaultValue={config.gym_name || ''}
                      onBlur={(e) => updateConfig('gym_name', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                      placeholder="Mi Gimnasio"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Dirección
                    </label>
                    <textarea
                      rows="3"
                      defaultValue={config.gym_address || ''}
                      onBlur={(e) => updateConfig('gym_address', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                      placeholder="Dirección del gimnasio..."
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Teléfono de Contacto
                    </label>
                    <input
                      type="tel"
                      defaultValue={config.gym_phone || ''}
                      onBlur={(e) => updateConfig('gym_phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                      Email de Contacto
                    </label>
                    <input
                      type="email"
                      defaultValue={config.gym_email || ''}
                      onBlur={(e) => updateConfig('gym_email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                      }`}
                      placeholder="contacto@migimnasio.com"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar con información */}
          <div className="lg:col-span-1">
            <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Guía de Configuración
              </h3>
              <div className={`text-sm space-y-3 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                {activeTab === 'branding' && (
                  <>
                    <p>
                      <strong>Logo:</strong> Sube el logo de tu gimnasio. Se recomienda un tamaño de 300x300px con fondo transparente.
                    </p>
                    <p>
                      El logo aparecerá en el panel de administración, reportes y documentos generados.
                    </p>
                  </>
                )}
                {activeTab === 'appearance' && (
                  <>
                    <p>
                      <strong>Color Principal:</strong> Personaliza el color principal de la interfaz para que coincida con tu marca.
                    </p>
                    <p>
                      Los cambios se aplicarán inmediatamente en toda la aplicación.
                    </p>
                  </>
                )}
                {activeTab === 'general' && (
                  <>
                    <p>
                      <strong>Información General:</strong> Configura los datos básicos de tu gimnasio.
                    </p>
                    <p>
                      Esta información aparecerá en reportes, facturas y comunicaciones con los usuarios.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Estado del sistema */}
            <div className={`mt-6 p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                Estado del Sistema
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Base de datos
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Conectada
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    API Backend
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Activa
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                    Última actualización
                  </span>
                  <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Hace 2 minutos
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;