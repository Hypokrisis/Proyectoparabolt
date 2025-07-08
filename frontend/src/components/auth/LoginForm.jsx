import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";
import useAuth from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";

function LoginForm() {
  const { login } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    form: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: "",
        form: ""
      }));
    }
  };

  const validateField = (name, value) => {
    let error = "";
    
    switch (name) {
      case "email":
        if (!value) {
          error = "El correo electrónico es requerido";
        } else if (!/^\S+@\S+\.\S+$/.test(value)) {
          error = "Ingrese un correo electrónico válido";
        }
        break;
      case "password":
        if (!value) {
          error = "La contraseña es requerida";
        } else if (value.length < 6) {
          error = "La contraseña debe tener al menos 6 caracteres";
        }
        break;
      default:
        break;
    }
    
    return error;
  };

  const validateForm = () => {
    const newErrors = {
      email: validateField("email", formData.email),
      password: validateField("password", formData.password),
      form: ""
    };
    
    setErrors(newErrors);
    
    return !newErrors.email && !newErrors.password;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/login",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000 // 5 seconds timeout
        }
      );

      if (response.data.access_token) {
        login(response.data.access_token);
        navigate("/dashboard");
      } else {
        setErrors(prev => ({
          ...prev,
          form: "Respuesta inesperada del servidor"
        }));
      }
    } catch (err) {
      console.error("Error en la solicitud:", err);
      
      let errorMessage = "Error al iniciar sesión";
      
      if (err.response) {
        switch (err.response.status) {
          case 400:
            errorMessage = "Datos de formulario inválidos";
            break;
          case 401:
            errorMessage = "Credenciales incorrectas";
            break;
          case 403:
            errorMessage = "Acceso no autorizado";
            break;
          case 500:
            errorMessage = "Error del servidor. Intente más tarde";
            break;
          default:
            errorMessage = `Error: ${err.response.status}`;
        }
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "Tiempo de espera agotado. Intente nuevamente";
      } else if (err.message === "Network Error") {
        errorMessage = "No se pudo conectar al servidor";
      }
      
      setErrors(prev => ({
        ...prev,
        form: errorMessage
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className={`w-full max-w-md p-8 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="text-center mb-8">
          <img 
            src={theme === 'dark' ? "/logo-light.png" : "/logo-dark.png"} 
            alt="Gym Logo" 
            className="h-12 mx-auto mb-4"
          />
          <h2 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
            Acceso al Panel
          </h2>
          <p className={`mt-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            Ingrese sus credenciales para continuar
          </p>
        </div>
        
        {errors.form && (
          <div className="mb-6 p-3 flex items-center bg-red-100 text-red-700 rounded-lg">
            <FiAlertCircle className="mr-2" />
            {errors.form}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${errors.email ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="tu@email.com"
                disabled={isLoading}
                onBlur={() => {
                  const error = validateField("email", formData.email);
                  setErrors(prev => ({ ...prev, email: error }));
                }}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.email}
              </p>
            )}
          </div>
          
          <div>
            <label htmlFor="password" className={`block text-sm font-medium mb-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock className={`h-5 w-5 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={`block w-full pl-10 pr-10 py-2 rounded-lg border ${errors.password ? 'border-red-500' : theme === 'dark' ? 'border-gray-700 bg-gray-700 text-white' : 'border-gray-300 bg-white'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                placeholder="••••••••"
                disabled={isLoading}
                onBlur={() => {
                  const error = validateField("password", formData.password);
                  setErrors(prev => ({ ...prev, password: error }));
                }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                  {showPassword ? "Ocultar" : "Mostrar"}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FiAlertCircle className="mr-1" /> {errors.password}
              </p>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className={`h-4 w-4 rounded ${theme === 'dark' ? 'bg-gray-700 border-gray-600 text-blue-500' : 'border-gray-300 text-blue-600'} focus:ring-blue-500`}
              />
              <label htmlFor="remember-me" className={`ml-2 block text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                Recordar sesión
              </label>
            </div>
            
            <div className="text-sm">
              <a 
                href="/forgot-password" 
                className={`font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
              >
                ¿Olvidó su contraseña?
              </a>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                isLoading ? 'opacity-75 cursor-not-allowed' : ''
              } ${theme === 'dark' ? 'focus:ring-offset-gray-800' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar sesión"
              )}
            </button>
          </div>
        </form>
        
        <div className={`mt-6 text-center text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
          <p>
            ¿No tienes una cuenta?{' '}
            <a 
              href="/register" 
              className={`font-medium ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
            >
              Regístrate
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginForm;