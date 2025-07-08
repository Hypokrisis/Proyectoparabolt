import { useState } from 'react';
import { FiActivity, FiUsers, FiDollarSign, FiCalendar, FiTrendingUp, FiBarChart2 } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import MetricCard from '../context/MetricCard';
import LineChart from '../components/charts/LineChart';
import BarChart from '../components/charts/BarChart';
import DateRangePicker from '../components/ui/DateRangePicker';
import TabNavigation from '../components/ui/TabNavigation';

const MetricsPage = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date()
  });

  // Datos de ejemplo (en una aplicación real estos vendrían de una API)
  const metricsData = {
    general: [
      { title: 'Miembros activos', value: '1,245', change: '+12%', icon: <FiUsers /> },
      { title: 'Ingresos mensuales', value: '$28,450', change: '+5%', icon: <FiDollarSign /> },
      { title: 'Clases programadas', value: '86', change: '+8%', icon: <FiCalendar /> },
      { title: 'Nuevos miembros', value: '142', change: '+18%', icon: <FiTrendingUp /> }
    ],
    attendance: [
      { title: 'Asistencia promedio', value: '78%', change: '+3%', icon: <FiActivity /> },
      { title: 'Clases más populares', value: 'CrossFit', change: null, icon: <FiBarChart2 /> },
      { title: 'Horario pico', value: '6:00 PM', change: null, icon: <FiActivity /> },
      { title: 'Miembros frecuentes', value: '328', change: '+7%', icon: <FiUsers /> }
    ]
  };

  const attendanceData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Asistencia semanal',
        data: [120, 190, 170, 210, 240, 180, 150],
        borderColor: theme === 'dark' ? '#3b82f6' : '#2563eb',
        backgroundColor: theme === 'dark' ? '#1e3a8a' : '#93c5fd',
        tension: 0.3
      }
    ]
  };

  const revenueData = {
    labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Ingresos 2023',
        data: [12500, 19000, 17500, 21000, 24000, 28000],
        backgroundColor: theme === 'dark' ? '#4f46e5' : '#6366f1',
        borderColor: theme === 'dark' ? '#6366f1' : '#4f46e5',
        borderWidth: 1
      }
    ]
  };

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header y controles */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Métricas del Gimnasio
            </h1>
            <p className={`mt-1 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Visualiza el rendimiento y crecimiento de tu negocio
            </p>
          </div>
          <DateRangePicker 
            dateRange={dateRange}
            setDateRange={setDateRange}
            theme={theme}
          />
        </div>

        {/* Navegación por pestañas */}
        <TabNavigation
          tabs={[
            { id: 'general', label: 'General' },
            { id: 'attendance', label: 'Asistencia' },
            { id: 'revenue', label: 'Ingresos' },
            { id: 'classes', label: 'Clases' }
          ]}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          theme={theme}
        />

        {/* Tarjetas de métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {metricsData[activeTab]?.map((metric, index) => (
            <MetricCard
              key={index}
              title={metric.title}
              value={metric.value}
              change={metric.change}
              icon={metric.icon}
              theme={theme}
            />
          ))}
        </div>

        {/* Gráficos principales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Asistencia por día
            </h3>
            <div className="h-80">
              <LineChart data={attendanceData} theme={theme} />
            </div>
          </div>
          <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Ingresos mensuales
            </h3>
            <div className="h-80">
              <BarChart data={revenueData} theme={theme} />
            </div>
          </div>
        </div>

        {/* Tabla de datos recientes */}
        <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-medium mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Últimos registros
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    Miembro
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    Tipo
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    Fecha
                  </th>
                  <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {[1, 2, 3, 4, 5].map((item) => (
                  <tr key={item}>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                      Miembro {item}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      {item % 2 === 0 ? 'Clase grupal' : 'Entrenamiento personal'}
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      {new Date().toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item % 2 === 0 ? (theme === 'dark' ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800') : (theme === 'dark' ? 'bg-blue-900 text-blue-200' : 'bg-blue-100 text-blue-800')}`}>
                        {item % 2 === 0 ? 'Completado' : 'Programado'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsPage;