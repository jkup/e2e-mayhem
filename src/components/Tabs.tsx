import { useState } from 'react';

interface TabsProps {
  tabs: { label: string; content: React.ReactNode }[];
  testId?: string;
}

export function Tabs({ tabs, testId = 'tabs' }: TabsProps) {
  const [active, setActive] = useState(0);

  return (
    <div data-testid={testId}>
      <div className="flex border-b" role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={i}
            role="tab"
            aria-selected={i === active}
            data-testid={`${testId}-tab-${i}`}
            onClick={() => setActive(i)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${i === active ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div data-testid={`${testId}-panel`} role="tabpanel" className="py-4">
        {tabs[active].content}
      </div>
    </div>
  );
}
