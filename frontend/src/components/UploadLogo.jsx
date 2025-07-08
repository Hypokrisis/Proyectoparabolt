import { useState, useRef, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { FiUpload, FiTrash2, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import { useTheme } from '../context/ThemeContext';

const UploadLogo = ({ onUploadSuccess }) => {
  const { theme } = useTheme();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef();

  // Cargar logo existente al montar el componente
  useEffect(() => {
    const fetchCurrentLogo = async () => {
      try {
        const { data, error } = await supabase
          .from('config')
          .select('value')
          .eq('key', 'gym_logo')
          .single();

        if (!error && data?.value) {
          setPreviewUrl(data.value);
        }
      } catch (err) {
        console.error('Error fetching current logo:', err);
      }
    };

    fetchCurrentLogo();
  }, []);

  const handleFileChange = async (file) => {
    if (!file) return;

    // Validación del archivo
    if (!file.type.match('image.*')) {
      setError('Por favor sube solo archivos de imagen (JPEG, PNG, SVG)');
      return false;
    }

    if (file.size > 2 * 1024 * 1024) {
      setError('El archivo es demasiado grande (máximo 2MB)');
      return false;
    }

    return true;
  };

  const uploadFile = async (file) => {
    try {
      setUploading(true);
      setError(null);
      setSuccess(null);

      // Crear URL de previsualización
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Subir a Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `gym_logo_${Date.now()}.${fileExt}`;
      const filePath = `logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('gym-logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Obtener URL pública
      const { data: publicData } = supabase.storage
        .from('gym-logos')
        .getPublicUrl(filePath);
      
      if (!publicData?.publicUrl) throw new Error('No se pudo obtener la URL pública');
      const publicUrl = publicData.publicUrl;

      // Guardar referencia en la base de datos
      const { error: dbError } = await supabase
        .from('config')
        .upsert(
          { key: 'gym_logo', value: publicUrl },
          { onConflict: 'key' }
        );

      if (dbError) throw dbError;

      // Notificar éxito
      setSuccess('Logo subido correctamente');
      if (onUploadSuccess) {
        onUploadSuccess(publicUrl);
      }

      return true;
    } catch (err) {
      console.error('Error subiendo logo:', err);
      setError(err.message || 'Error al subir el logo');
      setPreviewUrl(null);
      return false;
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!(await handleFileChange(file))) return;

    await uploadFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!(await handleFileChange(file))) return;

    await uploadFile(file);
  };

  const removeLogo = async () => {
    try {
      if (!previewUrl) return;

      // Extraer el path del logo actual de la URL
      const url = new URL(previewUrl);
      const pathParts = url.pathname.split('/');
      const filePath = pathParts.slice(pathParts.indexOf('logos')).join('/');

      // Eliminar de Supabase Storage
      const { error: deleteError } = await supabase.storage
        .from('gym-logos')
        .remove([filePath]);

      if (deleteError) throw deleteError;

      // Eliminar de la base de datos
      const { error: dbError } = await supabase
        .from('config')
        .delete()
        .eq('key', 'gym_logo');

      if (dbError) throw dbError;

      // Limpiar estado
      setPreviewUrl(null);
      setSuccess('Logo eliminado correctamente');
      if (onUploadSuccess) {
        onUploadSuccess(null);
      }
    } catch (err) {
      console.error('Error eliminando logo:', err);
      setError(err.message || 'Error al eliminar el logo');
    }
  };

  return (
    <div className={`space-y-6 p-6 rounded-lg ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm`}>
      <div className="text-center">
        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
          Logo del Gimnasio
        </h3>
        <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mt-1`}>
          Sube una imagen para representar tu gimnasio
        </p>
      </div>

      {previewUrl && (
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-between w-full mb-2">
            <h4 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
              Vista previa:
            </h4>
            <button
              onClick={removeLogo}
              className={`flex items-center text-sm ${theme === 'dark' ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-500'}`}
              disabled={uploading}
            >
              <FiTrash2 className="mr-1" /> Eliminar
            </button>
          </div>
          <div className={`p-3 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'} border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-200'}`}>
            <img 
              src={previewUrl} 
              alt="Vista previa del logo" 
              className="h-40 object-contain mx-auto"
            />
          </div>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? theme === 'dark'
              ? 'border-blue-500 bg-gray-700'
              : 'border-blue-400 bg-blue-50'
            : theme === 'dark'
            ? 'border-gray-600 hover:border-gray-500'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <label htmlFor="logo-upload-input" className="flex flex-col items-center justify-center space-y-3">
          <FiUpload
            className={`h-12 w-12 ${
              uploading 
                ? 'text-gray-400' 
                : theme === 'dark' 
                  ? 'text-gray-400' 
                  : 'text-gray-500'
            }`}
          />
          <div className="flex text-sm">
            <span
              className={`relative rounded-md font-medium ${
                uploading
                  ? 'text-gray-500'
                  : theme === 'dark'
                  ? 'text-blue-400 hover:text-blue-300'
                  : 'text-blue-600 hover:text-blue-500'
              }`}
            >
              {uploading ? 'Subiendo...' : 'Selecciona un archivo'}
              <input 
                id="logo-upload-input"
                ref={fileInputRef}
                type="file" 
                accept="image/jpeg,image/png,image/svg+xml"
                onChange={handleInputChange}
                className="sr-only"
                disabled={uploading}
              />
            </span>
            <p className={`pl-1 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
              o arrástralo aquí
            </p>
          </div>
          <p className={`text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
            PNG, JPG, SVG hasta 2MB
          </p>
        </label>
      </div>

      {error && (
        <div className={`p-3 rounded-lg flex items-start ${theme === 'dark' ? 'bg-red-900/30 text-red-400' : 'bg-red-50 text-red-600'}`}>
          <FiAlertCircle className="flex-shrink-0 mt-0.5 mr-2" />
          <div>
            <p className="font-medium">Error:</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className={`p-3 rounded-lg flex items-start ${theme === 'dark' ? 'bg-green-900/30 text-green-400' : 'bg-green-50 text-green-600'}`}>
          <FiCheckCircle className="flex-shrink-0 mt-0.5 mr-2" />
          <div>
            <p className="font-medium">Éxito:</p>
            <p className="text-sm">{success}</p>
          </div>
        </div>
      )}

      <div className={`text-center text-xs ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
        <p>Recomendado: 300x300px • Fondo transparente (PNG/SVG)</p>
        <p>El logo aparecerá en facturas, reportes y el panel</p>
      </div>
    </div>
  );
};

export default UploadLogo;