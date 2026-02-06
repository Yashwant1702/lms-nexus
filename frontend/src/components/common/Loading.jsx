import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({
  size = 'md',
  text = '',
  fullScreen = false,
  className = '',
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 className={`${sizes[size]} animate-spin text-primary-500`} />
      {text && (
        <p className="text-sm text-gray-600 dark:text-gray-400">{text}</p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-charcoal-700 z-50">
        {content}
      </div>
    );
  }

  return content;
};

export default Loading;

// Skeleton Loader Component
export const Skeleton = ({ className = '', variant = 'text' }) => {
  const variants = {
    text: 'h-4 w-full',
    title: 'h-8 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    thumbnail: 'h-48 w-full',
    button: 'h-10 w-24',
  };

  return (
    <div
      className={`
        animate-pulse bg-gray-200 dark:bg-gray-700 rounded
        ${variants[variant]}
        ${className}
      `}
    />
  );
};
