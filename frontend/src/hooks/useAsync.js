import { useState, useCallback } from 'react';

/**
 * Hook for async operations
 * @param {Function} asyncFunction - Async function to execute
 * @returns {Object} - { execute, loading, error, data }
 */
export const useAsync = (asyncFunction) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const execute = useCallback(
    async (...params) => {
      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction(...params);
        setData(result);
        return result;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [asyncFunction]
  );

  return { execute, loading, error, data };
};
