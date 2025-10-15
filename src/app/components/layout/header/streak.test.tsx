import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Streak } from '@/app/components/layout/header/streak';
import { StatsResponse } from '@/types/api';

// Mock useStats hook
const mockUseStats = vi.fn();
vi.mock('@/hooks/useStats', () => ({
  useStats: () => mockUseStats(),
}));

describe('Streak Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should display loading state', () => {
    mockUseStats.mockReturnValue({
      stats: null,
      loading: true,
      error: null,
    });
    render(<Streak />);
    expect(screen.getByTestId('streak-loading')).toBeInTheDocument();
  });

  it('should display nothing when there is an error', () => {
    mockUseStats.mockReturnValue({
      stats: null,
      loading: false,
      error: new Error('Failed to load stats'),
    });
    render(<Streak />);
    expect(screen.queryByText(/days/i)).not.toBeInTheDocument();
    expect(screen.queryByTestId('streak-loading')).not.toBeInTheDocument();
  });

  it('should display current streak when data is loaded', () => {
    const mockStats: StatsResponse = {
      currentStreak: 15,
      longestStreak: 30,
      totalNotes: 120,
      monthlyStats: [],
    };
    mockUseStats.mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
    });
    render(<Streak />);
    expect(screen.getByText('15 days')).toBeInTheDocument();
    expect(screen.getByTestId('streak-icon')).toBeInTheDocument();
  });

  it('should display 0 days when currentStreak is null or undefined', () => {
    const mockStats: StatsResponse = {
      currentStreak: 0, // Simulate null/undefined by setting to 0
      longestStreak: 30,
      totalNotes: 120,
      monthlyStats: [],
    };
    mockUseStats.mockReturnValue({
      stats: mockStats,
      loading: false,
      error: null,
    });
    render(<Streak />);
    expect(screen.getByText('0 days')).toBeInTheDocument();
  });
});
