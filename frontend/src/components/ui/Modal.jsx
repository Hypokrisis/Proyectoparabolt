import React from 'react';

const Modal = ({ isOpen, onClose, title, children, theme }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6 relative`}>
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700">✕</button>
        {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
        {children}
      </div>
    </div>
  );
};

export default Modal;
