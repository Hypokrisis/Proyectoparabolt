import { QRCode } from 'react-qr-code'; // Importación correcta
import { useState } from 'react';

const QRCodeModal = ({ cardId, onClose }) => {
  const [size, setSize] = useState(256);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(cardId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Código QR de Acceso</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        </div>
        
        <div className="flex flex-col items-center">
          <QRCode 
            value={cardId} 
            size={size}
            level="H"
            className="mb-4"
          />
          
          <div className="text-center w-full">
            <div className="flex items-center justify-center mb-3">
              <p className="text-sm text-gray-600 mr-2">ID: {cardId}</p>
              <button
                onClick={copyToClipboard}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                {copied ? '✓ Copiado!' : 'Copiar ID'}
              </button>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => setSize(prev => Math.max(128, prev - 32))}
                className={`px-3 py-1 rounded-md ${size <= 128 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
                disabled={size <= 128}
              >
                Reducir
              </button>
              <span className="text-sm flex items-center">{size}px</span>
              <button 
                onClick={() => setSize(prev => Math.min(512, prev + 32))}
                className={`px-3 py-1 rounded-md ${size >= 512 ? 'bg-gray-100 text-gray-400' : 'bg-gray-200 hover:bg-gray-300'}`}
                disabled={size >= 512}
              >
                Aumentar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeModal;