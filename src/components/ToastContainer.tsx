import type { Toast } from '../hooks/useToast';

const typeStyles: Record<Toast['type'], string> = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500 text-black',
  error: 'bg-red-500',
};

export function ToastContainer({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: string) => void }) {
  return (
    <div data-testid="toast-container" className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map(toast => (
        <div
          key={toast.id}
          data-testid={`toast-${toast.type}`}
          className={`${typeStyles[toast.type]} text-white px-4 py-3 rounded-lg shadow-lg flex justify-between items-center animate-slide-in`}
          role="alert"
        >
          <span>{toast.message}</span>
          <button
            data-testid="toast-dismiss"
            onClick={() => onDismiss(toast.id)}
            className="ml-2 text-white/80 hover:text-white"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}
