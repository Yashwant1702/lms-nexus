import React from 'react';
import { User } from 'lucide-react';
import { getInitials } from '@utils/helpers';

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  status,
  className = '',
  onClick,
}) => {
  const sizes = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  };

  const statusColors = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    busy: 'bg-red-500',
    away: 'bg-yellow-500',
  };

  return (
    <div className={`relative inline-block ${onClick ? 'cursor-pointer' : ''}`} onClick={onClick}>
      {src ? (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className={`
            ${sizes[size]}
            rounded-full object-cover
            ${className}
          `}
        />
      ) : (
        <div
          className={`
            ${sizes[size]}
            rounded-full
            bg-primary-500 text-white
            flex items-center justify-center
            font-semibold
            ${className}
          `}
        >
          {name ? getInitials(name) : <User className="w-1/2 h-1/2" />}
        </div>
      )}
      
      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSizes[size]}
            ${statusColors[status]}
            border-2 border-white dark:border-gray-800
            rounded-full
          `}
        />
      )}
    </div>
  );
};

export default Avatar;
