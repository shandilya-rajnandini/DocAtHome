import React from 'react';

const Modal = ({ isOpen, onClose, title, children, showDefaultClose = true, size = 'lg' }) => {
  // Handle escape key press
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div 
        className={`bg-secondary-dark rounded-lg shadow-xl p-6 w-full ${size === 'xl' ? 'max-w-5xl' : size === 'lg' ? 'max-w-lg' : 'max-w-md'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title">
        <div className="flex justify-between items-center mb-4">
          <h3 id="modal-title" className="text-2xl font-bold text-white">{title}</h3>
          {showDefaultClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl"
              aria-label="Close modal"
            >
              &times;
            </button>
          )}
        </div>
        <div className="text-secondary-text">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
