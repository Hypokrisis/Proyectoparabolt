import React, { useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import UserRegistrationForm from "./UserRegistrationForm";
import EditModal from "./EditModal";
import QRCodeModal from "./QRCodeModal";
import UserMetrics from "./UserMetrics";
import UploadLogo from "./UploadLogo";
import { supabase } from "../services/supabaseClient";
import { useNavigate } from "react-router-dom";

function AdminPanel() {
  const { theme, toggleTheme } = useTheme();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCardId, setQrCardId] = useState('');
  const [showMetricsFor, setShowMetricsFor] = useState(null);
  const [gymLogo, setGymLogo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/users", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error cargando usuarios:", error);
      setError("Error al cargar los usuarios. Intenta recargar la página.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      await fetchUsers();

      try {
        const { data: logoData, error: supabaseError } = await supabase
          .from('config')
          .select('value')
          .eq('key', 'gym_logo')
          .single();
        
        if (supabaseError) throw supabaseError;
        if (logoData) setGymLogo(logoData.value);
      } catch (error) {
        console.error("Error cargando logo:", error);
      }
    };

    fetchInitialData();
  }, [navigate]);

  const handleDelete = async (card_id) => {
    if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;
    
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8000/delete_user/${card_id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        await fetchUsers();
      } else {
        const error = await response.json();
        alert("No se pudo eliminar el usuario. " + error.detail);
      }
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("Error de red al eliminar el usuario.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user?.active) || 
                         (statusFilter === 'inactive' && !user?.active);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`min-h-screen p-4 md:p-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={fetchUsers}
              className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        )}

        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            {gymLogo && (
              <img 
                src={gymLogo} 
                alt="Logo del Gimnasio" 
                className="h-12 object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Panel de Administrador</h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                Gestión de usuarios registrados
              </p>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4">
            <UploadLogo onUploadSuccess={setGymLogo} />
            <button 
              onClick={toggleTheme}
              className={`p-2 rounded-full ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'}`}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar sesión
            </button>
          </div>
        </header>

        <section className={`mb-10 p-6 rounded-xl shadow-sm border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <h2 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Registrar nuevo usuario
          </h2>
          <UserRegistrationForm onSuccess={fetchUsers} />
        </section>

        <section className={`rounded-xl shadow-sm overflow-hidden border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
          <div className={`px-6 py-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-100'} flex flex-col md:flex-row justify-between items-start md:items-center gap-4`}>
            <h2 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
              Usuarios registrados
            </h2>
            
            <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar por nombre o email..."
                  className={`pl-10 pr-4 py-2 border rounded-lg w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300'}`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              
              <select
                className={`px-4 py-2 border rounded-lg ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300'}`}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="inactive">Inactivos</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-8 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className={`p-8 text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              {users.length === 0 ? "No hay usuarios registrados" : "No hay usuarios que coincidan con los filtros"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className={theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Nombre
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Email
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Teléfono
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      RFID
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Estado
                    </th>
                    <th className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${theme === 'dark' ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
                  {filteredUsers.map((user) => (
                    <tr key={user.card_id} className={theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                          {user.name}
                        </div>
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        {user.email}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        {user.phone}
                      </td>
                      <td className={`px-6 py-4 whitespace-nowrap font-mono text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        {user.card_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {user.active ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap space-x-2">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className={`inline-flex items-center px-3 py-1 border rounded-md ${theme === 'dark' ? 'border-blue-400 text-blue-400 hover:bg-blue-900' : 'border-blue-500 text-blue-600 hover:bg-blue-50'}`}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => {
                            setQrCardId(user.card_id);
                            setShowQRModal(true);
                          }}
                          className={`inline-flex items-center px-3 py-1 border rounded-md ${theme === 'dark' ? 'border-purple-400 text-purple-400 hover:bg-purple-900' : 'border-purple-500 text-purple-600 hover:bg-purple-50'}`}
                        >
                          QR
                        </button>
                        <button
                          onClick={() => setShowMetricsFor(user.card_id)}
                          className={`inline-flex items-center px-3 py-1 border rounded-md ${theme === 'dark' ? 'border-green-400 text-green-400 hover:bg-green-900' : 'border-green-500 text-green-600 hover:bg-green-50'}`}
                        >
                          Métricas
                        </button>
                        <button
                          onClick={() => handleDelete(user.card_id)}
                          className={`inline-flex items-center px-3 py-1 border rounded-md ${theme === 'dark' ? 'border-red-400 text-red-400 hover:bg-red-900' : 'border-red-500 text-red-600 hover:bg-red-50'}`}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {selectedUser && (
          <EditModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onSave={() => {
              setSelectedUser(null);
              fetchUsers();
            }}
          />
        )}

        {showQRModal && (
          <QRCodeModal 
            cardId={qrCardId} 
            onClose={() => setShowQRModal(false)} 
          />
        )}

        {showMetricsFor && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`rounded-lg p-6 w-full max-w-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Métricas del Usuario</h3>
                <button 
                  onClick={() => setShowMetricsFor(null)}
                  className={`${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  ✕
                </button>
              </div>
              <UserMetrics cardId={showMetricsFor} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminPanel;