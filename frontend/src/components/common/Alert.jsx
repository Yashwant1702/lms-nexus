import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle, X } from 'lucide-react';

const Alert = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  className = '',
}) => {
  const variants = {
    success: {
      container: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      icon: <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />,
      title: 'text-green-800 dark:text-green-300',
      text: 'text-green-700 dark:text-green-400',
    },
    error: {
      container: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
      icon: <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />,
      title: 'text-red-800 dark:text-red-300',
      text: 'text-red-700 dark:text-red-400',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800',
      icon: <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />,
      title: 'text-yellow-800 dark:text-yellow-300',
      text: 'text-yellow-700 dark:text-yellow-400',
    },
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
      title: 'text-blue-800 dark:text-blue-300',
      text: 'text-blue-700 dark:text-blue-400',
    },
  };

  const config = variants[variant];

  return (
    <div
      className={`
        rounded-lg border p-4
        ${config.container}
        ${className}
      `}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {config.icon}
        </div>
        
        <div className="flex-1">
          {title && (
            <h4 className={`font-semibold mb-1 ${config.title}`}>
              {title}
            </h4>
          )}
          {children && (
            <div className={`text-sm ${config.text}`}>
              {children}
            </div>
          )}
        </div>
        
        {dismissible && (
          <button
            onClick={onDismiss}
            className={`flex-shrink-0 ${config.text} hover:opacity-70`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
