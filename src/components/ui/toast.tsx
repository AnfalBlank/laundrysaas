"use client";

import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, X, XCircle } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type ToastVariant = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  variant: ToastVariant;
  title: string;
  description?: string;
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((cur) => cur.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((cur) => [...cur, { ...t, id }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove]
  );

  const value: ToastContextValue = {
    toast,
    success: (title, description) => toast({ variant: "success", title, description }),
    error: (title, description) => toast({ variant: "error", title, description }),
    info: (title, description) => toast({ variant: "info", title, description }),
    warning: (title, description) => toast({ variant: "warning", title, description }),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-[calc(100%-2rem)] sm:w-auto">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => remove(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const variantStyles: Record<ToastVariant, { bg: string; icon: ReactNode }> = {
  success: {
    bg: "bg-green-50 border-green-200 text-green-900",
    icon: <CheckCircle2 size={18} className="text-green-600" />,
  },
  error: {
    bg: "bg-red-50 border-red-200 text-red-900",
    icon: <XCircle size={18} className="text-red-600" />,
  },
  info: {
    bg: "bg-blue-50 border-blue-200 text-blue-900",
    icon: <Info size={18} className="text-blue-600" />,
  },
  warning: {
    bg: "bg-amber-50 border-amber-200 text-amber-900",
    icon: <AlertCircle size={18} className="text-amber-600" />,
  },
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const v = variantStyles[toast.variant];
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-3 shadow-lg backdrop-blur flex items-start gap-3 animate-in",
        v.bg
      )}
      role="alert"
    >
      <span className="shrink-0 mt-0.5">{v.icon}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm">{toast.title}</p>
        {toast.description && (
          <p className="text-xs opacity-90 mt-0.5">{toast.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="shrink-0 opacity-70 hover:opacity-100"
        aria-label="Close"
      >
        <X size={14} />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
