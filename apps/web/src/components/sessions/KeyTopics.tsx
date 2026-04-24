'use client';

interface KeyTopicsProps {
  topics: string[];
}

export function KeyTopics({ topics }: KeyTopicsProps) {
  if (!topics.length) return null;

  return (
    <div className="card mb-4">
      <h2 className="font-semibold text-gray-900 mb-3">Key Topics Discussed</h2>
      <div className="flex flex-wrap gap-2">
        {topics.map((topic) => (
          <span
            key={topic}
            className="px-3 py-1 text-xs font-medium bg-primary-50 text-primary-600 rounded-full"
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
