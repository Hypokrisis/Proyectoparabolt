import { useState, useEffect } from 'react';
import { 
  FiUsers, FiUserPlus, FiSearch, FiFilter, 
  FiEdit2, FiTrash2, FiDownload, FiChevronRight,
  FiChevronLeft, FiX, FiCheck, FiAlertCircle
} from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { exportToCSV } from "../utils/exportHelpers";

const UsersPage = () => {
  const { theme } = useTheme();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const usersPerPage = 10;

  // Obtener usuarios reales del backend
  useEffect(() => {
    setLoading(true);
    setError(null);
    const fetchUsers = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No has iniciado sesión. Por favor, inicia sesión para ver los usuarios.');
        setLoading(false);
        setUsers([]);
        setFilteredUsers([]);
        return;
      }
      try {
        const response = await fetch('http://localhost:8000/users', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) throw new Error('No autorizado o error de red');
        const data = await response.json();
        setUsers(data);
        setFilteredUsers(data);
      } catch (err) {
        setError('Error al cargar usuarios');
        setUsers([]);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Filtros y búsqueda
  useEffect(() => {
    let results = users;
    
    if (searchTerm) {
      results = results.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      results = results.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(results);
    setCurrentPage(1);
  }, [searchTerm, statusFilter, users]);

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleEdit = (user) => {
    setCurrentUser(user);
    setIsModalOpen(true);
  };

  // Eliminar usuario usando la API real
  const handleDelete = async (card_id) => {
    const token = localStorage.getItem('token');
    if (!window.confirm('¿Seguro que deseas eliminar este usuario?')) return;
    try {
      const response = await fetch(`http://localhost:8000/users/${card_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Error al eliminar usuario');
      setUsers(users.filter(u => u.card_id !== card_id));
    } catch (err) {
      setError(err.message);
    }
  };

  // Editar y crear usuarios usando la API real
  const handleSubmit = async (userData) => {
    const token = localStorage.getItem('token');
    try {
      if (currentUser) {
        // PUT al backend
        const response = await fetch(`http://localhost:8000/users/${currentUser.card_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Error al editar usuario');
        const updated = await response.json();
        setUsers(users.map(u => u.card_id === currentUser.card_id ? updated : u));
      } else {
        // POST al backend
        const response = await fetch('http://localhost:8000/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(userData)
        });
        if (!response.ok) throw new Error('Error al crear usuario');
        const created = await response.json();
        setUsers([...users, created.user]);
      }
      setIsModalOpen(false);
      setCurrentUser(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = () => {
    exportToCSV(filteredUsers, 'usuarios_gimnasio');
  };

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'active', label: 'Activos' },
    { value: 'inactive', label: 'Inactivos' },
    { value: 'pending', label: 'Pendientes' }
  ];

  const membershipOptions = [
    { value: 'basic', label: 'Básica' },
    { value: 'premium', label: 'Premium' },
    { value: 'vip', label: 'VIP' }
  ];

  const statusBadge = (status) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch(status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`;
      case 'inactive':
        return `${baseClasses} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300`;
    }
  };

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <FiUsers className="mr-3" /> Gestión de Usuarios
            </h1>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Administra los miembros y sus membresías del gimnasio
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <button
              onClick={() => {
                setCurrentUser(null);
                setIsModalOpen(true);
              }}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                theme === 'dark' ? 'focus:ring-offset-gray-900' : ''
              }`}
            >
              <FiUserPlus className="mr-2" /> Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <div className={`mb-8 p-6 rounded-xl shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                </div>
                <input
                  type="text"
                  className={`block w-full pl-10 pr-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                    theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 placeholder-gray-500 text-gray-900'
                  }`}
                  placeholder="Buscar por nombre o email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="status-filter" className="sr-only">Estado</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiFilter className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                  </div>
                  <select
                    id="status-filter"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                    }`}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleExport}
                className={`inline-flex items-center justify-center px-4 py-3 border rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  theme === 'dark' ? 'bg-gray-700 border-gray-600 text-gray-300 hover:bg-gray-600 focus:ring-offset-gray-800' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiDownload className="mr-2" /> Exportar
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className={`overflow-hidden rounded-xl shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Cargando usuarios...</p>
            </div>
          ) : error ? (
            <div className={`p-8 text-center ${theme === 'dark' ? 'text-red-400' : 'text-red-600'}`}>
              <FiAlertCircle className="mx-auto h-12 w-12" />
              <p className="mt-4">{error}</p>
            </div>
          ) : (
            <>
              {/* Tabla de usuarios */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
                    <tr>
                      <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Nombre
                      </th>
                      <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Email
                      </th>
                      <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Teléfono
                      </th>
                      <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Membresía
                      </th>
                      <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Estado
                      </th>
                      <th scope="col" className={`px-6 py-4 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Último acceso
                      </th>
                      <th scope="col" className={`px-6 py-4 text-right text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    {currentUsers.length > 0 ? (
                      currentUsers.map((user) => (
                        <tr key={user.id} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                            {user.name}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {user.email}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {user.phone}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {user.membership}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={statusBadge(user.status)}>
                              {user.status === 'active' ? 'Activo' : user.status === 'pending' ? 'Pendiente' : 'Inactivo'}
                            </span>
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            {user.lastAccess}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => handleEdit(user)}
                                className={`p-2 rounded-md ${theme === 'dark' ? 'text-blue-400 hover:bg-gray-700' : 'text-blue-600 hover:bg-gray-100'}`}
                                title="Editar"
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                onClick={() => handleDelete(user.card_id)}
                                className={`p-2 rounded-md ${theme === 'dark' ? 'text-red-400 hover:bg-gray-700' : 'text-red-600 hover:bg-gray-100'}`}
                                title="Eliminar"
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className={`px-6 py-4 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                          No se encontraron usuarios
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Paginación */}
              {filteredUsers.length > usersPerPage && (
                <div className={`px-6 py-4 flex items-center justify-between border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                        currentPage === 1 
                          ? theme === 'dark' 
                            ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                          : theme === 'dark' 
                            ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className={`ml-3 relative inline-flex items-center px-4 py-2 border rounded-md text-sm font-medium ${
                        currentPage === totalPages 
                          ? theme === 'dark' 
                            ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' 
                            : 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                          : theme === 'dark' 
                            ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' 
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Siguiente
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-700'}`}>
                        Mostrando <span className="font-medium">{indexOfFirstUser + 1}</span> a{' '}
                        <span className="font-medium">{Math.min(indexOfLastUser, filteredUsers.length)}</span> de{' '}
                        <span className="font-medium">{filteredUsers.length}</span> usuarios
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border text-sm font-medium ${
                            currentPage === 1 
                              ? theme === 'dark' 
                                ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' 
                                : 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                              : theme === 'dark' 
                                ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Anterior</span>
                          <FiChevronLeft className="h-5 w-5" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                currentPage === pageNum
                                  ? theme === 'dark'
                                    ? 'z-10 bg-blue-800 border-blue-500 text-white'
                                    : 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                  : theme === 'dark'
                                    ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border text-sm font-medium ${
                            currentPage === totalPages 
                              ? theme === 'dark' 
                                ? 'bg-gray-800 border-gray-700 text-gray-500 cursor-not-allowed' 
                                : 'bg-white border-gray-300 text-gray-400 cursor-not-allowed'
                              : theme === 'dark' 
                                ? 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700' 
                                : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <span className="sr-only">Siguiente</span>
                          <FiChevronRight className="h-5 w-5" />
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Modal para editar/crear usuario */}
        {isModalOpen && (
          <div className={`fixed inset-0 overflow-y-auto ${theme === 'dark' ? 'bg-gray-900 bg-opacity-75' : 'bg-gray-500 bg-opacity-75'}`}>
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="flex items-start justify-between">
                    <h3 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {currentUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsModalOpen(false);
                        setCurrentUser(null);
                      }}
                      className={`rounded-md p-1.5 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'}`}
                    >
                      <FiX className="h-6 w-6" />
                    </button>
                  </div>
                  <div className="mt-4">
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          defaultValue={currentUser?.name || ''}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          defaultValue={currentUser?.email || ''}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          defaultValue={currentUser?.phone || ''}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      <div>
                        <label htmlFor="membership" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Membresía
                        </label>
                        <select
                          id="membership"
                          name="membership"
                          defaultValue={currentUser?.membership ? currentUser.membership.toLowerCase() : 'basic'}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                        >
                          {membershipOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {currentUser && (
                        <div>
                          <label htmlFor="status" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Estado
                          </label>
                          <select
                            id="status"
                            name="status"
                            defaultValue={currentUser?.status || 'active'}
                            className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                              theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                            }`}
                          >
                            <option value="active">Activo</option>
                            <option value="inactive">Inactivo</option>
                            <option value="pending">Pendiente</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <button
                    type="button"
                    onClick={(e) => {
                      const formData = {
                        name: document.getElementById('name').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        membership: document.getElementById('membership').value,
                        status: currentUser ? document.getElementById('status')?.value : 'active'
                      };
                      handleSubmit(formData);
                    }}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white sm:ml-3 sm:w-auto sm:text-sm ${
                      theme === 'dark' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    <FiCheck className="mr-2 h-5 w-5" />
                    {currentUser ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setCurrentUser(null);
                    }}
                    className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                      theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersPage;