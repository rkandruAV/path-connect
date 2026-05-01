'use client';

interface KeyInsightsProps {
  insights: string[];
}

export function KeyInsights({ insights }: KeyInsightsProps) {
  if (!insights.length) return null;

  return (
    <div className="card mb-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
          </svg>
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">Key Insights</h2>
          <p className="text-xs text-gray-400">Important takeaways from your session</p>
        </div>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => (
          <div key={index} className="flex gap-3 p-3 bg-accent-50/50 rounded-lg">
            <span className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center text-xs font-semibold text-accent-700 shrink-0">
              {index + 1}
            </span>
            <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
