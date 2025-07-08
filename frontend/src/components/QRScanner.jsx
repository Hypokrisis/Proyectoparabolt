import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const QRScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(success, error);

    function success(result) {
      scanner.clear();
      setScanResult(result);
      checkAccess(result);
    }

    function error(err) {
      console.warn(err);
    }

    return () => {
      scanner.clear();
    };
  }, []);

  const checkAccess = async (cardId) => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`http://localhost:8000/check_access/${cardId}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.detail || 'Error al verificar acceso');
      
      // Mostrar resultado
      setScanResult(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Escanear QR de Acceso</h1>
      
      {!scanResult ? (
        <div id="reader" className="w-full mb-4"></div>
      ) : (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <h2 className="text-xl font-semibold mb-2">Resultado:</h2>
          <p className="mb-2">ID: {scanResult.card_id || scanResult}</p>
          
          {scanResult.access ? (
            <div className="bg-green-100 text-green-800 p-3 rounded">
              <p className="font-bold">✓ Acceso permitido</p>
              {scanResult.expiration && (
                <p>Válido hasta: {new Date(scanResult.expiration).toLocaleDateString()}</p>
              )}
            </div>
          ) : (
            <div className="bg-red-100 text-red-800 p-3 rounded">
              <p className="font-bold">✗ Acceso denegado</p>
              <button 
                onClick={() => navigate('/renew')}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Renovar con ATH Móvil
              </button>
            </div>
          )}
        </div>
      )}

      <button 
        onClick={() => setScanResult(null)}
        className="w-full bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300"
      >
        Escanear otro código
      </button>
    </div>
  );
};