'use client';

export type ProgressTab = 'overview' | 'actions' | 'insights';

interface ProgressTabsProps {
  activeTab: ProgressTab;
  onTabChange: (tab: ProgressTab) => void;
}

const tabs: { id: ProgressTab; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'actions', label: 'Actions' },
  { id: 'insights', label: 'Insights' },
];

export function ProgressTabs({ activeTab, onTabChange }: ProgressTabsProps) {
  return (
    <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === tab.id
              ? 'bg-white text-primary-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
