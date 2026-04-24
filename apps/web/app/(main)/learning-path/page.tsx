'use client';

import { useState } from 'react';
import { ProgressHeader } from '@/components/learning/ProgressHeader';
import { ProgressStats } from '@/components/learning/ProgressStats';
import { ProgressTabs, type ProgressTab } from '@/components/learning/ProgressTabs';
import { OverviewTab } from '@/components/learning/OverviewTab';
import { ActionsTab } from '@/components/learning/ActionsTab';
import { InsightsTab } from '@/components/learning/InsightsTab';

export default function LearningPathPage() {
  const [activeTab, setActiveTab] = useState<ProgressTab>('overview');

  return (
    <div>
      <ProgressHeader />
      <ProgressStats />
      <ProgressTabs activeTab={activeTab} onTabChange={setActiveTab} />

      {activeTab === 'overview' && <OverviewTab />}
      {activeTab === 'actions' && <ActionsTab />}
      {activeTab === 'insights' && <InsightsTab />}
    </div>
  );
}
