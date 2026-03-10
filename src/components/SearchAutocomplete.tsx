import { useState, useRef, useEffect, useCallback } from 'react';

interface SearchItem {
  type: string;
  id: string;
  label: string;
  sub: string;
}

interface SearchAutocompleteProps {
  items: SearchItem[];
  onSelect: (item: SearchItem) => void;
  testId?: string;
}

export function SearchAutocomplete({ items, onSelect, testId = 'search-autocomplete' }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.length >= 1
    ? items.filter(item => item.label.toLowerCase().includes(query.toLowerCase()) || item.sub.toLowerCase().includes(query.toLowerCase())).slice(0, 8)
    : [];

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      onSelect(filtered[activeIndex]);
      setQuery('');
      setOpen(false);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  }, [activeIndex, filtered, onSelect]);

  return (
    <div ref={ref} className="relative" data-testid={testId}>
      <input
        ref={inputRef}
        data-testid={`${testId}-input`}
        type="text"
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); setActiveIndex(-1); }}
        onFocus={() => query.length >= 1 && setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search users, departments..."
        className="w-full px-4 py-2 border rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        aria-label="Search"
        role="combobox"
        aria-expanded={open && filtered.length > 0}
        aria-autocomplete="list"
      />
      {open && filtered.length > 0 && (
        <ul data-testid={`${testId}-results`} className="absolute w-full mt-1 bg-white border rounded-lg shadow-lg z-20 max-h-64 overflow-auto" role="listbox">
          {filtered.map((item, i) => (
            <li
              key={item.id}
              data-testid={`${testId}-result-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              className={`px-4 py-2 cursor-pointer ${i === activeIndex ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              onClick={() => { onSelect(item); setQuery(''); setOpen(false); }}
              onMouseEnter={() => setActiveIndex(i)}
            >
              <div className="text-sm font-medium text-gray-900">{item.label}</div>
              <div className="text-xs text-gray-500">{item.type} · {item.sub}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
