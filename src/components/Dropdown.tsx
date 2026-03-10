import { useState, useRef, useEffect } from 'react';

interface DropdownProps {
  trigger: React.ReactNode;
  items: { label: string; onClick: () => void; danger?: boolean; children?: { label: string; onClick: () => void }[] }[];
  testId?: string;
}

export function Dropdown({ trigger, items, testId = 'dropdown' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const [submenuIndex, setSubmenuIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSubmenuIndex(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative inline-block" data-testid={testId}>
      <div onClick={() => setOpen(!open)} data-testid={`${testId}-trigger`}>{trigger}</div>
      {open && (
        <div data-testid={`${testId}-menu`} className="absolute right-0 mt-1 w-48 bg-white border rounded-lg shadow-lg z-30 py-1">
          {items.map((item, i) => (
            <div key={i} className="relative" onMouseEnter={() => item.children ? setSubmenuIndex(i) : setSubmenuIndex(null)}>
              <button
                data-testid={`${testId}-item-${i}`}
                onClick={() => { item.onClick(); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex justify-between ${item.danger ? 'text-red-600' : 'text-gray-700'}`}
              >
                {item.label}
                {item.children && <span>›</span>}
              </button>
              {item.children && submenuIndex === i && (
                <div data-testid={`${testId}-submenu-${i}`} className="absolute left-full top-0 w-40 bg-white border rounded-lg shadow-lg py-1 ml-1">
                  {item.children.map((child, j) => (
                    <button
                      key={j}
                      data-testid={`${testId}-subitem-${i}-${j}`}
                      onClick={() => { child.onClick(); setOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {child.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
