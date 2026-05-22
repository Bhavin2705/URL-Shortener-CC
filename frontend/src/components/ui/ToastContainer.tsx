import type { Toast } from '../../hooks/useToast';

interface Props { toasts: Toast[]; onDismiss: (id: number) => void }

const icons = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};
const styles = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  error:   'border-rose-500/30 bg-rose-500/10 text-rose-300',
  info:    'border-brand-500/30 bg-brand-500/10 text-brand-300',
};

export default function ToastContainer({ toasts, onDismiss }: Props) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          onClick={() => onDismiss(t.id)}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-body shadow-card backdrop-blur-sm animate-slide-in cursor-pointer ${styles[t.type]}`}
        >
          <span className="font-mono font-bold text-xs w-4 text-center">{icons[t.type]}</span>
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
