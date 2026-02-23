import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

const Alert = ({ type = 'info', message, onClose }) => {
  const types = {
    info: {
      icon: Info,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200',
      iconColor: 'text-blue-400',
    },
    success: {
      icon: CheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      borderColor: 'border-green-200',
      iconColor: 'text-green-400',
    },
    warning: {
      icon: AlertCircle,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200',
      iconColor: 'text-yellow-400',
    },
    error: {
      icon: XCircle,
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-200',
      iconColor: 'text-red-400',
    },
  };

  const { icon: Icon, bgColor, textColor, borderColor, iconColor } = types[type];

  return (
    <div className={`rounded-lg border p-4 ${bgColor} ${borderColor} ${textColor}`}>
      <div className="flex items-start">
        <Icon className={`h-5 w-5 ${iconColor} mr-3 flex-shrink-0`} />
        <div className="flex-1 text-sm">{message}</div>
        {onClose && (
          <button onClick={onClose} className={`ml-3 ${textColor} hover:opacity-75`}>
            <XCircle className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;