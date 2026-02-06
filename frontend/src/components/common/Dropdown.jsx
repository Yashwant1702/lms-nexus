import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClickOutside } from '@hooks/useClickOutside';

const Dropdown = ({
  trigger,
  children,
  align = 'left',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useClickOutside(() => setIsOpen(false));

  const alignments = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`
              absolute top-full mt-2 z-50
              ${alignments[align]}
              ${className}
            `}
          >
            <div className="bg-white dark:bg-charcoal-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[200px]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DropdownItem = ({ children, onClick, icon, danger = false }) => (
  <button
    onClick={onClick}
    className={`
      w-full text-left px-4 py-2 text-sm
      flex items-center gap-2
      transition-colors
      ${danger
        ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      }
    `}
  >
    {icon && <span className="w-4 h-4">{icon}</span>}
    {children}
  </button>
);

export const DropdownDivider = () => (
  <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
);

export default Dropdown;
