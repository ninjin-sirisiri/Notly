import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { StatsProvider, useStatsContext } from '@/context/stats-context';
import type { StatsResponse } from '@/types/api';

// Mock the global window.api object
const mockApi = {
  stats: {
    get: vi.fn(),
  },
};
vi.stubGlobal('api', mockApi);

const mockStats: StatsResponse = {
  currentStreak: 10,
  longestStreak: 25,
  totalNotes: 100,
  monthlyStats: [],
};

// A wrapper component that provides the StatsContext
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <StatsProvider>{children}</StatsProvider>
);

describe('useStatsContext Hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should load stats on initial render', async () => {
    mockApi.stats.get.mockResolvedValue(mockStats);

    const { result, rerender } = renderHook(() => useStatsContext(), { wrapper });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      rerender();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.stats).toEqual(mockStats);
    expect(mockApi.stats.get).toHaveBeenCalledTimes(1);
  });

  it('should handle error when loading stats', async () => {
    const testError = new Error('Failed to load stats');
    mockApi.stats.get.mockRejectedValue(testError);

    const { result, rerender } = renderHook(() => useStatsContext(), { wrapper });

    await act(async () => {
      rerender();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(testError);
    expect(result.current.stats).toBeNull();
  });

  it('should refresh stats when refresh is called', async () => {
    mockApi.stats.get.mockResolvedValueOnce({ ...mockStats, currentStreak: 5 }); // Initial load
    mockApi.stats.get.mockResolvedValueOnce({ ...mockStats, currentStreak: 15 }); // After refresh

    const { result, rerender } = renderHook(() => useStatsContext(), { wrapper });

    await act(async () => {
      rerender(); // Initial load
    });
    expect(result.current.stats?.currentStreak).toBe(5);

    await act(async () => {
      await result.current.refresh(); // Call refresh
    });

    expect(result.current.stats?.currentStreak).toBe(15);
    expect(mockApi.stats.get).toHaveBeenCalledTimes(2);
  });
});
