import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'warning' | 'info' | 'error';

interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ConfirmOptions {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'primary';
  onConfirm: () => void;
}

interface ToastContextType {
  showToast: (title: string, description?: string, type?: ToastType) => void;
  requestConfirm: (options: ConfirmOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fallback if called outside provider
    return {
      showToast: (title, description) => {
        console.info('[GearSync Notice]:', title, description || '');
      },
      requestConfirm: (options) => {
        if (window.confirm(`${options.title}\n\n${options.description}`)) {
          options.onConfirm();
        }
      },
    };
  }
  return ctx;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<ConfirmOptions | null>(null);

  const showToast = useCallback((title: string, description?: string, type: ToastType = 'success') => {
    const id = 'toast_' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3600);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const requestConfirm = useCallback((options: ConfirmOptions) => {
    setConfirmDialog(options);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, requestConfirm }}>
      {children}

      {/* Floating Toast Stack */}
      <div
        aria-live="polite"
        className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[70] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((t) => {
          const iconMap = {
            success: <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />,
            warning: <AlertTriangle size={18} className="text-amber-400 shrink-0" />,
            error: <AlertTriangle size={18} className="text-rose-400 shrink-0" />,
            info: <Info size={18} className="text-sky-400 shrink-0" />,
          };
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl bg-[#22202B]/95 backdrop-blur-xl border border-white/10 shadow-2xl animate-scale-in text-left"
            >
              <div className="mt-0.5">{iconMap[t.type]}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#F7F6F9] leading-snug">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-[#A6A2B5] mt-0.5 leading-relaxed">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismissToast(t.id)}
                className="p-1 rounded-full text-[#6E6A7E] hover:text-[#F7F6F9] hover:bg-white/5 transition-colors"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Confirmation Dialog Modal */}
      {confirmDialog && (
        <div
          className="fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setConfirmDialog(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-dialog-title"
            className="w-full max-w-md rounded-[28px] bg-[#1D1B24] border border-white/10 p-6 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-rose-500/15 text-rose-400 border border-rose-500/25'
                    : 'bg-[#FF5E36]/15 text-[#FF5E36] border border-[#FF5E36]/25'
                }`}
              >
                <AlertTriangle size={20} />
              </div>
              <div className="flex-1">
                <h3 id="confirm-dialog-title" className="text-lg font-bold text-[#F7F6F9]">
                  {confirmDialog.title}
                </h3>
                <p className="text-sm text-[#A6A2B5] mt-1.5 leading-relaxed">
                  {confirmDialog.description}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="px-5 py-2.5 rounded-full bg-[#25232E] hover:bg-[#2E2B39] text-sm font-medium text-[#F7F6F9] border border-white/5 transition-colors"
              >
                {confirmDialog.cancelLabel || 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const fn = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  fn();
                }}
                className={`px-5 py-2.5 rounded-full text-sm font-semibold text-white transition-all shadow-lg ${
                  confirmDialog.variant === 'danger'
                    ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
                    : 'gs-btn-primary'
                }`}
              >
                {confirmDialog.confirmLabel || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

