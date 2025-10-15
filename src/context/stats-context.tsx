'use client';

import { createContext, useState, useEffect, useCallback, useContext, ReactNode } from 'react';
import type { StatsResponse } from '../types/api';

interface StatsContextType {
  stats: StatsResponse | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

const StatsContext = createContext<StatsContextType | undefined>(undefined);

export function StatsProvider({ children }: { children: ReactNode }) {
  const [stats, setStats] = useState<StatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      const result = await window.api.stats.get();
      setStats(result);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const value = {
    stats,
    loading,
    error,
    refresh: loadStats,
  };

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}

export function useStatsContext() {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStatsContext must be used within a StatsProvider');
  }
  return context;
}
