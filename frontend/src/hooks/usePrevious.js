import { useRef, useEffect } from 'react';

/**
 * Hook that returns the previous value
 * @param {*} value - Current value
 * @returns {*} - Previous value
 */
export const usePrevious = (value) => {
  const ref = useRef();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
};
