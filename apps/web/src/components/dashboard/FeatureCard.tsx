'use client';

import Link from 'next/link';

interface FeatureCardProps {
  href: string;
  icon: React.ReactNode;
  iconBgColor: string;
  title: string;
  subtitle: string;
  badge?: string;
  children?: React.ReactNode;
  comingSoon?: boolean;
}

export function FeatureCard({ href, icon, iconBgColor, title, subtitle, badge, children, comingSoon }: FeatureCardProps) {
  const content = (
    <div className="card hover:shadow-md transition-shadow cursor-pointer relative">
      {comingSoon && (
        <span className="absolute top-3 right-3 px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-500 rounded-full">
          Coming Soon
        </span>
      )}
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg ${iconBgColor} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{title}</h3>
            {badge && (
              <span className="px-2 py-0.5 text-[10px] font-medium bg-primary-50 text-primary-600 rounded-full">
                {badge}
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
          {children && <div className="mt-3">{children}</div>}
        </div>
        <svg className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );

  if (comingSoon) return content;

  return <Link href={href}>{content}</Link>;
}
