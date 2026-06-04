import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from 'react';

import Toast from '../components/Toast';

type ToastType = 'success' | 'info' | 'error';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

const ToastContext = createContext<any>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const remove = (id: number) =>
    setToasts((t) => t.filter((toast) => toast.id !== id));

  const push = useCallback((message: string, type: ToastType) => {
    setToasts((t) => [
      ...t,
      { id: Date.now() + Math.random(), message, type },
    ]);
  }, []);

  const toast = {
    success: (msg: string) => push(msg, 'success'),
    error: (msg: string) => push(msg, 'error'),
    info: (msg: string) => push(msg, 'info'),
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* viewport */}
      <div className="fixed top-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              message={t.message}
              type={t.type}
              onClose={() => remove(t.id)}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);

  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return ctx;
}
