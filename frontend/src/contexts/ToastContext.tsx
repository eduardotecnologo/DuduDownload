import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';

type ToastVariant = 'default' | 'success' | 'error' | 'warning';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (toast: Omit<ToastItem, 'id'>) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

export const useToast = (): ToastContextValue => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }

  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const toast = React.useCallback((item: Omit<ToastItem, 'id'>) => {
    const nextToast: ToastItem = {
      id: crypto.randomUUID(),
      ...item
    };

    setToasts((current) => [...current, nextToast]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((toastItem) => toastItem.id !== nextToast.id));
    }, 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      {createPortal(
        <div className="fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-3 pointer-events-none">
          {toasts.map((item) => (
            <div
              key={item.id}
              className={cn(
                'pointer-events-auto rounded-2xl border px-4 py-3 shadow-glow backdrop-blur-md animate-fadeUp',
                item.variant === 'success' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
                item.variant === 'error' && 'border-rose-500/30 bg-rose-500/10 text-rose-100',
                item.variant === 'warning' && 'border-amber-500/30 bg-amber-500/10 text-amber-100',
                item.variant === 'default' && 'border-border bg-card text-card-foreground'
              )}
            >
              <p className="text-sm font-semibold">{item.title}</p>
              {item.description ? <p className="mt-1 text-sm opacity-90">{item.description}</p> : null}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};
