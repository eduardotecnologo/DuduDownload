import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../lib/utils';
const ToastContext = React.createContext(null);
export const useToast = () => {
    const context = React.useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = React.useState([]);
    const toast = React.useCallback((item) => {
        const nextToast = {
            id: crypto.randomUUID(),
            ...item
        };
        setToasts((current) => [...current, nextToast]);
        window.setTimeout(() => {
            setToasts((current) => current.filter((toastItem) => toastItem.id !== nextToast.id));
        }, 4500);
    }, []);
    return (_jsxs(ToastContext.Provider, { value: { toast }, children: [children, createPortal(_jsx("div", { className: "fixed right-4 top-4 z-[70] flex w-full max-w-sm flex-col gap-3 pointer-events-none", children: toasts.map((item) => (_jsxs("div", { className: cn('pointer-events-auto rounded-2xl border px-4 py-3 shadow-glow backdrop-blur-md animate-fadeUp', item.variant === 'success' && 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100', item.variant === 'error' && 'border-rose-500/30 bg-rose-500/10 text-rose-100', item.variant === 'warning' && 'border-amber-500/30 bg-amber-500/10 text-amber-100', item.variant === 'default' && 'border-border bg-card text-card-foreground'), children: [_jsx("p", { className: "text-sm font-semibold", children: item.title }), item.description ? _jsx("p", { className: "mt-1 text-sm opacity-90", children: item.description }) : null] }, item.id))) }), document.body)] }));
};
