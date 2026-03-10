import { useEffect } from 'react';

interface SlideOverProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function SlideOver({ open, onClose, title, children }: SlideOverProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {open && (
        <div data-testid="slideover-backdrop" className="fixed inset-0 bg-black/30 z-30" onClick={onClose} />
      )}
      <div
        data-testid="slideover"
        className={`fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-40 transform transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-label={title} /* BUG-18: aria-modal removed */
      >
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
          <button data-testid="slideover-close" onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl" aria-label="Close panel">×</button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-65px)]">
          {children}
        </div>
      </div>
    </>
  );
}
