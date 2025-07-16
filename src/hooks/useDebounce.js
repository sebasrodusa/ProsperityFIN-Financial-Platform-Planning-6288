import { useCallback, useEffect, useRef } from 'react';

const useDebounce = (callback, delay = 500) => {
  const timeoutRef = useRef(null);

  const debounced = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debounced;
};

export default useDebounce;

