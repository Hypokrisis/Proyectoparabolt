import { useState, useEffect } from 'react';
import { FiFileText, FiDownload, FiUsers, FiDollarSign, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const ReportsPage = () => {
  const { theme } = useTheme();
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState('users');

  const fetchReports = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/reports/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReports(data);
      } else {
        toast.error('Error al cargar reportes');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const generateReport = (type) => {
    if (!reports) return;

    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'users':
        csvContent = [
          ['Nombre', 'Email', 'Teléfono', 'Membresía', 'Estado', 'Fecha de Registro'],
          ...reports.users.map(user => [
            user.name,
            user.email,
            user.phone,
            user.membership,
            user.active ? 'Activo' : 'Inactivo',
            new Date(user.created_at).toLocaleDateString()
          ])
        ].map(row => row.join(',')).join('\n');
        filename = 'reporte_usuarios.csv';
        break;
      
      case 'membership':
        csvContent = [
          ['Tipo de Membresía', 'Cantidad', 'Porcentaje'],
          ['Básica', reports.membership_distribution.basic, `${((reports.membership_distribution.basic / reports.total_users) * 100).toFixed(1)}%`],
          ['Premium', reports.membership_distribution.premium, `${((reports.membership_distribution.premium / reports.total_users) * 100).toFixed(1)}%`],
          ['VIP', reports.membership_distribution.vip, `${((reports.membership_distribution.vip / reports.total_users) * 100).toFixed(1)}%`]
        ].map(row => row.join(',')).join('\n');
        filename = 'reporte_membresias.csv';
        break;
      
      default:
        return;
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Reporte generado correctamente');
  };

  const ReportCard = ({ title, description, icon, onClick, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      yellow: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    };

    return (
      <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} hover:shadow-md transition-shadow cursor-pointer`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
            {icon}
          </div>
          <button
            onClick={onClick}
            className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
              theme === 'dark' 
                ? 'text-blue-400 bg-blue-900 hover:bg-blue-800' 
                : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
            }`}
          >
            <FiDownload className="mr-1 h-4 w-4" />
            Descargar
          </button>
        </div>
        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Cargando reportes...</p>
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
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <FiFileText className="mr-3" /> Reportes y Análisis
            </h1>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Genera reportes detallados sobre el rendimiento del gimnasio
            </p>
          </div>
        </div>

        {/* Estadísticas generales */}
        {reports && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  <FiUsers className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {reports.total_users}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Usuarios
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                  <FiTrendingUp className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {reports.active_users}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Usuarios Activos
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                  <FiDollarSign className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {reports.membership_distribution.premium}
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Membresías Premium
                  </p>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="flex items-center">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                  <FiCalendar className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    {((reports.active_users / reports.total_users) * 100).toFixed(1)}%
                  </p>
                  <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                    Tasa de Actividad
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tipos de reportes disponibles */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <ReportCard
            title="Reporte de Usuarios"
            description="Lista completa de todos los usuarios registrados con sus datos personales y estado de membresía."
            icon={<FiUsers className="h-6 w-6" />}
            onClick={() => generateReport('users')}
            color="blue"
          />

          <ReportCard
            title="Distribución de Membresías"
            description="Análisis de la distribución de tipos de membresía entre los usuarios activos."
            icon={<FiDollarSign className="h-6 w-6" />}
            onClick={() => generateReport('membership')}
            color="green"
          />

          <ReportCard
            title="Reporte de Asistencia"
            description="Estadísticas de asistencia y patrones de uso del gimnasio por parte de los miembros."
            icon={<FiCalendar className="h-6 w-6" />}
            onClick={() => toast.info('Funcionalidad próximamente disponible')}
            color="yellow"
          />

          <ReportCard
            title="Análisis Financiero"
            description="Resumen de ingresos, pagos pendientes y proyecciones financieras del gimnasio."
            icon={<FiTrendingUp className="h-6 w-6" />}
            onClick={() => toast.info('Funcionalidad próximamente disponible')}
            color="purple"
          />

          <ReportCard
            title="Reporte de Clases"
            description="Estadísticas de participación en clases grupales y evaluación de instructores."
            icon={<FiCalendar className="h-6 w-6" />}
            onClick={() => toast.info('Funcionalidad próximamente disponible')}
            color="blue"
          />

          <ReportCard
            title="Análisis de Retención"
            description="Métricas de retención de usuarios y análisis de cancelaciones de membresías."
            icon={<FiUsers className="h-6 w-6" />}
            onClick={() => toast.info('Funcionalidad próximamente disponible')}
            color="green"
          />
        </div>

        {/* Distribución de membresías */}
        {reports && (
          <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-lg font-medium mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Distribución de Membresías
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                  {reports.membership_distribution.basic}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Membresías Básicas
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {((reports.membership_distribution.basic / reports.total_users) * 100).toFixed(1)}% del total
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-yellow-400' : 'text-yellow-600'}`}>
                  {reports.membership_distribution.premium}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Membresías Premium
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {((reports.membership_distribution.premium / reports.total_users) * 100).toFixed(1)}% del total
                </div>
              </div>
              
              <div className="text-center">
                <div className={`text-3xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                  {reports.membership_distribution.vip}
                </div>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  Membresías VIP
                </div>
                <div className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                  {((reports.membership_distribution.vip / reports.total_users) * 100).toFixed(1)}% del total
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;