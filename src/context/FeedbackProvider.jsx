import { AnimatePresence, m } from 'framer-motion';
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FeedbackContext } from './FeedbackContext';


const TOAST_DURATION_MS = 3500;
const TOAST_ICONS = { success: CheckCircle2, error: AlertTriangle, info: Info };

export const FeedbackProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const timersRef = useRef(new Map());

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((timer) => clearTimeout(timer));
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    clearTimeout(timersRef.current.get(id));
    timersRef.current.delete(id);
  }, []);

  const notify = useCallback(
    (message, type = 'info') => {
      const id = `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current.slice(-2), { id, message, type }]);
      timersRef.current.set(id, setTimeout(() => dismissToast(id), TOAST_DURATION_MS));
    },
    [dismissToast],
  );

  // confirm() asíncrono basado en promesa: `if (await confirm({...}))`.
  const confirm = useCallback(
    ({ title, message, confirmLabel = 'Confirmar', tone = 'primary' }) =>
      new Promise((resolve) => setDialog({ title, message, confirmLabel, tone, resolve })),
    [],
  );

  const closeDialog = (result) => {
    dialog?.resolve(result);
    setDialog(null);
  };

  const value = useMemo(() => ({ notify, confirm }), [notify, confirm]);

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="fixed inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none" aria-live="polite">
        <AnimatePresence>
          {toasts.map((toast) => {
            const Icon = TOAST_ICONS[toast.type] ?? Info;
            return (
              <m.div
                key={toast.id}
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="card pointer-events-auto flex w-full max-w-sm items-center gap-3 px-4 py-3 text-sm font-semibold"
                role={toast.type === 'error' ? 'alert' : 'status'}
              >
                <Icon size={18} className={toast.type === 'error' ? 'text-accent' : 'text-secondary'} aria-hidden />
                <span className="flex-1">{toast.message}</span>
                <button type="button" className="text-muted" onClick={() => dismissToast(toast.id)} aria-label="Cerrar aviso">
                  <X size={16} />
                </button>
              </m.div>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {dialog && (
          <m.div
            className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => closeDialog(false)}
          >
            <m.div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-title"
              className="card w-full max-w-sm p-5"
              initial={{ y: 24 }}
              animate={{ y: 0 }}
              exit={{ y: 24 }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2 id="confirm-title" className="text-lg font-bold">{dialog.title}</h2>
              {dialog.message && <p className="mt-2 text-sm text-secondary">{dialog.message}</p>}
              <div className="mt-5 flex gap-2">
                <button type="button" className="btn btn-ghost flex-1" onClick={() => closeDialog(false)}>Cancelar</button>
                <button
                  type="button"
                  autoFocus
                  className={`btn flex-1 ${dialog.tone === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                  onClick={() => closeDialog(true)}
                >
                  {dialog.confirmLabel}
                </button>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </FeedbackContext.Provider>
  );
};
