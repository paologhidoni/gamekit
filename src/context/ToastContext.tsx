/* eslint-disable react-refresh/only-export-components -- useToast is tied to ToastProvider */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastContextValue = {
  showToast: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const TOAST_MS = 4000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) clearTimeout(timeoutRef.current);
    };
  }, []);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    if (timeoutRef.current !== undefined) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setMessage(null);
      timeoutRef.current = undefined;
    }, TOAST_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message !== null && (
        <div
          role="status"
          className="fixed top-12 left-1/2 z-100 max-w-[min(90vw,24rem)] -translate-x-1/2 rounded-xl border-2 border-(--color-accent-secondary) bg-(--color-bg-secondary) px-4 py-3 text-center text-sm text-(--color-text-primary) shadow-lg"
        >
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}
