import { useEffect, useRef, useState } from 'react';

/**
 * Hook that uses Intersection Observer API
 * @param {Object} options - IntersectionObserver options
 * @returns {Array} - [ref, isIntersecting, entry]
 */
export const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [entry, setEntry] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      setEntry(entry);
    }, options);

    observer.observe(ref.current);

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [options.threshold, options.root, options.rootMargin]);

  return [ref, isIntersecting, entry];
};
