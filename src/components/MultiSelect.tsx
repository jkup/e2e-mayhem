import { useState, useRef, useEffect } from 'react';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  testId?: string;
}

export function MultiSelect({ options, selected, onChange, placeholder = 'Select...', testId = 'multiselect' }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  const toggle = (option: string) => {
    onChange(selected.includes(option) ? selected.filter(s => s !== option) : [...selected, option]);
  };

  return (
    <div ref={ref} className="relative" data-testid={testId}>
      <div
        data-testid={`${testId}-trigger`}
        onClick={() => setOpen(!open)}
        className="border rounded-lg px-3 py-2 cursor-pointer flex flex-wrap gap-1 min-h-[42px] bg-white"
      >
        {selected.length === 0 && <span className="text-gray-400">{placeholder}</span>}
        {selected.map(s => (
          <span key={s} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded flex items-center gap-1">
            {s}
            <button
              data-testid={`${testId}-remove-${s}`}
              onClick={(e) => { e.stopPropagation(); toggle(s); }}
              className="text-blue-600 hover:text-blue-800"
              aria-label={`Remove ${s}`}
            >×</button>
          </span>
        ))}
      </div>
      {open && (
        <div data-testid={`${testId}-dropdown`} className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-60 overflow-auto">
          <div className="p-2 border-b">
            <input
              data-testid={`${testId}-search`}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full px-2 py-1 text-sm border rounded"
              autoFocus
            />
          </div>
          {filtered.map(option => (
            <label
              key={option}
              data-testid={`${testId}-option-${option}`}
              className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
            >
              <input
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => toggle(option)}
                className="mr-2"
              />
              {option}
            </label>
          ))}
          {filtered.length === 0 && <div className="px-3 py-2 text-sm text-gray-400">No results</div>}
        </div>
      )}
    </div>
  );
}
