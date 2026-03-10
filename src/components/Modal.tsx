import { useEffect, useRef } from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function Modal({ open, onClose, title, children, footer }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Esc') onClose(); // BUG-10
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      data-testid="modal-overlay"
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/50"
      onClick={(e) => { if (e.target !== overlayRef.current) onClose(); }} // BUG-11
    >
      <div data-testid="modal" className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4" role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button data-testid="modal-close" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl" aria-label="Close modal">×</button>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && <div className="px-6 py-4 border-t bg-gray-50 rounded-b-xl flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
}
