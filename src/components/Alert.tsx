import React from 'react';

type AlertProps = {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  onClose?: () => void;
};

const Alert = ({ message, type, onClose }: AlertProps) => {
  const alertClasses = {
    success: 'bg-green-50 text-green-800 border-green-400',
    error: 'bg-red-50 text-red-800 border-red-400',
    info: 'bg-blue-50 text-blue-800 border-blue-400',
    warning: 'bg-yellow-50 text-yellow-800 border-yellow-400',
  };

  return (
    <div className={`p-4 mb-4 border-l-4 rounded-md ${alertClasses[type]}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm">{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="inline-flex text-gray-500 hover:text-gray-600 focus:outline-none"
          >
            <span className="sr-only">Close</span>
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
