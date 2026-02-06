import { useState, useEffect, useRef } from 'react';

/**
 * Hook for countdown timer
 * @param {number} initialTime - Initial time in seconds
 * @param {Function} onComplete - Callback when timer completes
 * @returns {Object} - Timer controls and state
 */
export const useTimer = (initialTime = 0, onComplete) => {
  const [time, setTime] = useState(initialTime);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && !isPaused && time > 0) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => {
          if (prevTime <= 1) {
            stop();
            if (onComplete) onComplete();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, time]);

  const start = () => {
    setIsActive(true);
    setIsPaused(false);
  };

  const pause = () => {
    setIsPaused(true);
  };

  const resume = () => {
    setIsPaused(false);
  };

  const stop = () => {
    setIsActive(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const reset = (newTime = initialTime) => {
    stop();
    setTime(newTime);
  };

  // Format time as MM:SS
  const formatTime = () => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return {
    time,
    isActive,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    formatTime,
  };
};
