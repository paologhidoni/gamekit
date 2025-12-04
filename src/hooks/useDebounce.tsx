import { useCallback, useEffect, useRef } from "react";

export default function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 500
) {
  // useRef to store the timer ID
  // (ReturnType<typeof setTimeout> works in both browser + Node)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Always refer to the latest callback
  // This avoids recreating the debounced function when the parent re-renders
  const callbackRef = useRef(callback);
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Wrap the callback in useCallback to maintain function identity
  const debounced = useCallback(
    (...args: Parameters<T>) => {
      // Clear the previous timer on every call
      if (timerRef.current) clearTimeout(timerRef.current);

      // Set a new timer
      timerRef.current = setTimeout(() => {
        // Call the latest callback stored in the ref
        callbackRef.current(...args);
      }, delay);
    },
    [delay]
  );

  // useEffect cleanup:
  // This runs only when the component unmounts
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return debounced;
}
