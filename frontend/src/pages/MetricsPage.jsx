import { useState, useEffect } from 'react';
import { FiActivity, FiUsers, FiDollarSign, FiCalendar, FiTrendingUp, FiBarChart2, FiRefreshCw } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const MetricsPage = () => {
  const { theme } = useTheme();
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('general');

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No has iniciado sesión');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/metrics', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Error al cargar métricas');
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      setError('Error al cargar métricas');
      toast.error('Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const MetricCard = ({ title, value, change, icon, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };

    return (
      <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
            {title}
          </h3>
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
        </div>
        <div className="mt-4">
          <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {value}
          </p>
          {change && (
            <p className={`mt-1 flex items-center text-sm ${
              change.startsWith('+') 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {change}
              <span className="ml-1">vs último mes</span>
            </p>
          )}
        </div>
      </div>
    );
  };

  const SimpleChart = ({ data, type = 'line' }) => {
    if (!data || !data.data) return <div>No hay datos disponibles</div>;

    const maxValue = Math.max(...data.data);
    const minValue = Math.min(...data.data);
    const range = maxValue - minValue || 1;

    return (
      <div className="h-64 flex items-end justify-between space-x-2 p-4">
        {data.data.map((value, index) => {
          const height = ((value - minValue) / range) * 200 + 20;
          return (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className={`w-full rounded-t ${theme === 'dark' ? 'bg-blue-500' : 'bg-blue-600'} transition-all duration-300 hover:opacity-80`}
                style={{ height: `${height}px` }}
                title={`${data.labels[index]}: ${value}`}
              />
              <span className={`text-xs mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                {data.labels[index]}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Cargando métricas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <p className={`text-red-600 dark:text-red-400`}>{error}</p>
          <button
            onClick={fetchMetrics}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Reintentar
          </button>
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
              Métricas del Gimnasio
            </h1>
            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Visualiza el rendimiento y crecimiento de tu negocio
            </p>
          </div>
          <button
            onClick={fetchMetrics}
            className={`mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium ${
              theme === 'dark' 
                ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <FiRefreshCw className="mr-2" /> Actualizar
          </button>
        </div>

        {/* Navegación por pestañas */}
        <div className={`mb-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <nav className="flex -mb-px space-x-8">
            {[
              { id: 'general', label: 'General' },
              { id: 'attendance', label: 'Asistencia' },
              { id: 'revenue', label: 'Ingresos' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? theme === 'dark'
                      ? 'border-blue-500 text-blue-400'
                      : 'border-blue-600 text-blue-600'
                    : theme === 'dark'
                    ? 'border-transparent text-gray-400 hover:text-gray-300'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tarjetas de métricas principales */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total de Usuarios"
            value={metrics?.summary?.total_users || 0}
            change="+12%"
            icon={<FiUsers />}
            color="blue"
          />
          <MetricCard
            title="Usuarios Activos"
            value={metrics?.summary?.active_users || 0}
            change="+5%"
            icon={<FiActivity />}
            color="green"
          />
          <MetricCard
            title="Clases Programadas"
            value={metrics?.summary?.total_classes || 0}
            change="+8%"
            icon={<FiCalendar />}
            color="purple"
          />
          <MetricCard
            title="Ingresos Mensuales"
            value={`$${metrics?.summary?.monthly_revenue || 0}`}
            change="+18%"
            icon={<FiDollarSign />}
            color="yellow"
          />
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Asistencia Semanal
            </h3>
            <SimpleChart data={metrics?.attendance_data} />
          </div>
          
          <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Actividad Reciente
            </h3>
            <div className="space-y-4">
              {metrics?.recent_activity?.slice(0, 5).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`flex-shrink-0 h-8 w-8 rounded-full ${theme === 'dark' ? 'bg-blue-600' : 'bg-blue-100'} flex items-center justify-center`}>
                    <FiUsers className={`h-4 w-4 ${theme === 'dark' ? 'text-white' : 'text-blue-600'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {activity.user_name}
                    </p>
                    <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                      Se registró como nuevo usuario
                    </p>
                  </div>
                  <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    {activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Hoy'}
                  </div>
                </div>
              )) || (
                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  No hay actividad reciente
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Estadísticas adicionales */}
        <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Resumen de Rendimiento
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-green-400' : 'text-green-600'}`}>
                {metrics?.summary?.growth_rate || 0}%
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Crecimiento mensual
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                {((metrics?.summary?.active_users / metrics?.summary?.total_users) * 100 || 0).toFixed(1)}%
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Tasa de actividad
              </div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                {metrics?.summary?.inactive_users || 0}
              </div>
              <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                Usuarios inactivos
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;