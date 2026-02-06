import React, { forwardRef } from 'react';

const Checkbox = forwardRef(({
  label,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className="flex items-start">
      <div className="flex items-center h-5">
        <input
          ref={ref}
          type="checkbox"
          className={`
            w-4 h-4 text-primary-600 border-gray-300 rounded
            focus:ring-2 focus:ring-primary-500 focus:ring-offset-0
            dark:border-gray-600 dark:bg-gray-700
            ${error ? 'border-red-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      
      {label && (
        <div className="ml-3 text-sm">
          <label className="text-gray-700 dark:text-gray-300">
            {label}
          </label>
          {error && (
            <p className="mt-1 text-sm text-red-500">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
