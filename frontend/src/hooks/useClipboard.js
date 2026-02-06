import { useState } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook for clipboard operations
 * @returns {Object} - { copy, copied }
 */
export const useClipboard = (resetDelay = 2000) => {
  const [copied, setCopied] = useState(false);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');

      setTimeout(() => {
        setCopied(false);
      }, resetDelay);

      return true;
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
      return false;
    }
  };

  return { copy, copied };
};
