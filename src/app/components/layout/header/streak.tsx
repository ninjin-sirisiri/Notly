'use client';

import { useStats } from '@/hooks/useStats';
import { Flame } from 'lucide-react';

export function Streak() {
  const { stats, loading, error } = useStats();

  if (loading) {
    return (
      <div
        data-testid="streak-loading"
        className="bg-gray-300 p-2 rounded w-24 h-9 animate-pulse"
      ></div>
    );
  }

  if (error) {
    console.error('Failed to load stats:', error);
    return null; // エラー時は何も表示しない、または最小限の表示
  }

  const streak = stats?.currentStreak ?? 0;

  return (
    <div className="flex items-center gap-1.5 bg-orange-100 text-orange-500 text-sm font-medium px-3 py-2 rounded-lg">
      <Flame data-testid="streak-icon" size={16} className="text-orange-400" />
      <span>{streak} days</span>
    </div>
  );
}
