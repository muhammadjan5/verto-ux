import { createContext, ReactNode, useCallback, useContext, useMemo, useRef, useState } from 'react';

type ToastVariant = 'default' | 'success' | 'error';

interface ToastOptions {
  variant?: ToastVariant;
}

interface ToastRecord {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  notify: (message: string, options?: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const timers = useRef<Map<number, number>>(new Map());

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    const timeoutId = timers.current.get(id);
    if (timeoutId) {
      window.clearTimeout(timeoutId);
      timers.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = Number(new Date()) + Math.random();
      const variant = options?.variant ?? 'default';
      setToasts((current) => [...current, { id, message, variant }]);

      const timeoutId = window.setTimeout(() => {
        dismiss(id);
      }, 4000);

      timers.current.set(id, timeoutId);
    },
    [dismiss],
  );

  const contextValue = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="toast-stack" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast toast--${toast.variant}`}>
            <span>{toast.message}</span>
            <button type="button" className="toast__close" onClick={() => dismiss(toast.id)} aria-label="Dismiss notification">
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }

  const { notify } = context;
  const success = useCallback((message: string) => notify(message, { variant: 'success' }), [notify]);
  const error = useCallback((message: string) => notify(message, { variant: 'error' }), [notify]);
  const info = useCallback((message: string) => notify(message, { variant: 'default' }), [notify]);

  return useMemo(
    () => ({
      notify,
      success,
      error,
      info,
    }),
    [notify, success, error, info],
  );
};
