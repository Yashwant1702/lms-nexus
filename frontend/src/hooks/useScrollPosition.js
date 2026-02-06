import { useState, useEffect } from 'react';
import { throttle } from '@utils/helpers';

/**
 * Hook that tracks scroll position
 * @returns {Object} - { x, y, direction }
 */
export const useScrollPosition = () => {
  const [scrollPosition, setScrollPosition] = useState({
    x: 0,
    y: 0,
    direction: 'down',
  });

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const handleScroll = throttle(() => {
      const currentScrollY = window.pageYOffset;
      
      setScrollPosition({
        x: window.pageXOffset,
        y: currentScrollY,
        direction: currentScrollY > lastScrollY ? 'down' : 'up',
      });

      lastScrollY = currentScrollY;
    }, 100);

    window.addEventListener('scroll', handleScroll);

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return scrollPosition;
};

/**
 * Hook that detects if scrolled past a threshold
 * @param {number} threshold - Threshold in pixels
 * @returns {boolean} - Whether scrolled past threshold
 */
export const useScrollPast = (threshold = 100) => {
  const { y } = useScrollPosition();
  return y > threshold;
};
