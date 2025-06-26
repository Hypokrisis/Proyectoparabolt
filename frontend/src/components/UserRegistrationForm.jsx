import { useState } from 'react';

const UserRegistrationForm = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    cardId: '',
    isActive: true
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    // Limpiar mensajes al editar
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('El nombre completo es obligatorio');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El email es obligatorio');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Por favor ingrese un email válido');
      return false;
    }
    if (!formData.phone.trim()) {
      setError('El teléfono es obligatorio');
      return false;
    }
    if (formData.phone.length < 9) {
      setError('El teléfono debe tener al menos 9 caracteres');
      return false;
    }
    if (!formData.cardId.trim()) {
      setError('El ID de tarjeta es obligatorio');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8000/register_user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          rfid_id: formData.cardId,
          is_active: formData.isActive
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      setSuccess(data.message || 'Usuario registrado exitosamente!');
      
      // Resetear formulario
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        cardId: '',
        isActive: true
      });

    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Ocurrió un error al registrar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-md overflow-hidden">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Registro de Miembros</h2>
        <p className="text-gray-600 mt-2">Complete el formulario para registrar nuevos miembros</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 text-green-700">
          <p>{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Ej: Juan Pérez"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Ej: juan@ejemplo.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Ej: +51987654321"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ID de tarjeta RFID</label>
          <input
            type="text"
            name="cardId"
            value={formData.cardId}
            onChange={handleChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            placeholder="Ej: A1B2C3D4"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          <label className="ml-2 block text-sm text-gray-900">Miembro activo</label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </span>
          ) : 'Registrar Miembro'}
        </button>
      </form>
    </div>
  );
};

export default UserRegistrationForm;