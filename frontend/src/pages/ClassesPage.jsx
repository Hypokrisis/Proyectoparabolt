import { useState, useEffect } from 'react';
import { FiCalendar, FiPlus, FiEdit2, FiTrash2, FiUsers, FiClock, FiUser } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const ClassesPage = () => {
  const { theme } = useTheme();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentClass, setCurrentClass] = useState(null);

  const fetchClasses = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/classes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setClasses(data);
      } else {
        toast.error('Error al cargar clases');
      }
    } catch (error) {
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSubmit = async (formData) => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch('http://127.0.0.1:8000/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Clase creada correctamente');
        setIsModalOpen(false);
        setCurrentClass(null);
        fetchClasses();
      } else {
        toast.error('Error al crear clase');
      }
    } catch (error) {
      toast.error('Error de conexión');
    }
  };

  return (
    <div className={`p-6 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} min-h-screen`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className={`text-3xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} flex items-center`}>
              <FiCalendar className="mr-3" /> Gestión de Clases
            </h1>
            <p className={`mt-2 text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Administra las clases y horarios del gimnasio
            </p>
          </div>
          <button
            onClick={() => {
              setCurrentClass(null);
              setIsModalOpen(true);
            }}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <FiPlus className="mr-2" /> Nueva Clase
          </button>
        </div>

        {/* Lista de clases */}
        <div className={`rounded-xl shadow-sm ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border`}>
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>Cargando clases...</p>
            </div>
          ) : classes.length === 0 ? (
            <div className="p-8 text-center">
              <FiCalendar className={`mx-auto h-12 w-12 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              <p className={`mt-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                No hay clases programadas
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <FiPlus className="mr-2" /> Crear primera clase
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
              {classes.map((classItem) => (
                <div
                  key={classItem.id}
                  className={`p-6 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'} hover:shadow-md transition-shadow`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                      {classItem.name}
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setCurrentClass(classItem);
                          setIsModalOpen(true);
                        }}
                        className={`p-2 rounded-md ${theme === 'dark' ? 'text-blue-400 hover:bg-gray-600' : 'text-blue-600 hover:bg-gray-200'}`}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className={`p-2 rounded-md ${theme === 'dark' ? 'text-red-400 hover:bg-gray-600' : 'text-red-600 hover:bg-gray-200'}`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <FiUser className={`mr-2 h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {classItem.instructor}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <FiClock className={`mr-2 h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        {classItem.schedule}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <FiUsers className={`mr-2 h-4 w-4 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                        Capacidad: {classItem.capacity} personas
                      </span>
                    </div>
                    
                    {classItem.description && (
                      <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-3`}>
                        {classItem.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal para crear/editar clase */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setIsModalOpen(false)}></div>
              
              <div className={`inline-block align-bottom rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const data = {
                    name: formData.get('name'),
                    instructor: formData.get('instructor'),
                    schedule: formData.get('schedule'),
                    capacity: parseInt(formData.get('capacity')),
                    description: formData.get('description')
                  };
                  handleSubmit(data);
                }}>
                  <div className={`px-4 pt-5 pb-4 sm:p-6 sm:pb-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                    <div className="flex items-start justify-between mb-4">
                      <h3 className={`text-lg leading-6 font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                        {currentClass ? 'Editar Clase' : 'Nueva Clase'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className={`rounded-md p-1.5 ${theme === 'dark' ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-400 hover:bg-gray-100'}`}
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Nombre de la clase
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          defaultValue={currentClass?.name || ''}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                          placeholder="Ej: Yoga Matutino"
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Instructor
                        </label>
                        <input
                          type="text"
                          name="instructor"
                          required
                          defaultValue={currentClass?.instructor || ''}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                          placeholder="Nombre del instructor"
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Horario
                        </label>
                        <input
                          type="text"
                          name="schedule"
                          required
                          defaultValue={currentClass?.schedule || ''}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                          placeholder="Ej: Lunes y Miércoles 7:00 AM"
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Capacidad
                        </label>
                        <input
                          type="number"
                          name="capacity"
                          required
                          min="1"
                          defaultValue={currentClass?.capacity || ''}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                          placeholder="Número máximo de participantes"
                        />
                      </div>
                      
                      <div>
                        <label className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                          Descripción (opcional)
                        </label>
                        <textarea
                          name="description"
                          rows="3"
                          defaultValue={currentClass?.description || ''}
                          className={`mt-1 block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
                            theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'
                          }`}
                          placeholder="Descripción de la clase..."
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className={`px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {currentClass ? 'Actualizar' : 'Crear'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className={`mt-3 w-full inline-flex justify-center rounded-md border shadow-sm px-4 py-2 text-base font-medium sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm ${
                        theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white hover:bg-gray-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassesPage;