"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type ToastVariant = "success" | "error";

export type ToastOptions = {
  variant?: ToastVariant;
  title?: string;
  message: string;
  durationMs?: number;
};

type Toast = {
  id: number;
  variant: ToastVariant;
  title?: string;
  message: string;
  durationMs: number;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
};

type ToastProviderProps = {
  children: React.ReactNode;
};

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [counter, setCounter] = useState(0);

  const showToast = useCallback((options: ToastOptions) => {
    setCounter((c) => c + 1);
    const id = counter + 1;
    const durationMs = options.durationMs ?? 5000;
    const toast: Toast = {
      id,
      variant: options.variant ?? "success",
      title: options.title,
      message: options.message,
      durationMs,
    };

    setToasts((prev) => [...prev, toast]);

    // Auto-dismiss après durationMs
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, durationMs);
  }, [counter]);

  const value = useMemo(
    () => ({
      showToast,
    }),
    [showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Container global en bas à droite */}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex max-w-xs flex-col gap-2 sm:max-w-sm">
        {toasts.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            onClose={() =>
              setToasts((prev) => prev.filter((t) => t.id !== toast.id))
            }
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

type ToastCardProps = {
  toast: Toast;
  onClose: () => void;
};

const ToastCard: React.FC<ToastCardProps> = ({ toast, onClose }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const start = performance.now();
    const duration = toast.durationMs;

    let frame: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const ratio = Math.min(1, elapsed / duration);
      setProgress(100 - ratio * 100);
      if (ratio < 1) {
        frame = requestAnimationFrame(tick);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
    };
  }, [toast.durationMs]);

  const isSuccess = toast.variant === "success";

  const baseClasses =
    "pointer-events-auto overflow-hidden rounded-2xl border px-4 py-3 text-xs shadow-lg backdrop-blur-md";
  const successClasses =
    "border-emerald-200 bg-emerald-50/95 text-emerald-900 dark:border-emerald-700/60 dark:bg-emerald-900/90 dark:text-emerald-50";
  const errorClasses =
    "border-red-200 bg-red-50/95 text-red-900 dark:border-red-700/60 dark:bg-red-900/90 dark:text-red-50";

  return (
    <div
      className={`${baseClasses} ${
        isSuccess ? successClasses : errorClasses
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-gradient-to-r from-[#22c55e] to-[#4ade80] dark:from-emerald-300 dark:to-emerald-400">
          {!isSuccess && (
            <span className="block h-2 w-2 rounded-full bg-gradient-to-r from-[#f97373] to-[#f97373] dark:from-red-300 dark:to-red-400" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80">
            {isSuccess ? "Succès" : "Erreur"}
          </p>
          {toast.title && (
            <p className="text-[11px] font-semibold">{toast.title}</p>
          )}
          <p className="text-[11px] leading-relaxed">{toast.message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="ml-2 text-[11px] font-medium opacity-60 hover:opacity-100"
        >
          ×
        </button>
      </div>
      <div className="mt-2 h-1 w-full rounded-full bg-black/5 dark:bg-white/10">
        <div
          className={`h-1 rounded-full transition-[width] ${
            isSuccess
              ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
              : "bg-gradient-to-r from-red-400 to-red-500"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};


