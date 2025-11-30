import { create } from 'zustand';
import { type ActivityLogItem, type DailyProgress, type UserGoal } from '@/types/activity';
import { invoke } from '@tauri-apps/api/core';

type ActivityState = {
  streak: number;
  activityLog: ActivityLogItem[];
  goals: UserGoal | null;
  dailyProgress: DailyProgress | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchStreak: () => Promise<void>;
  fetchActivityLog: () => Promise<void>;
  fetchGoals: () => Promise<void>;
  updateGoals: (goals: UserGoal) => Promise<void>;
  fetchDailyProgress: () => Promise<void>;
  recordActivity: (charDiff: number) => Promise<void>;
};

export const useActivityStore = create<ActivityState>((set, get) => ({
  streak: 0,
  activityLog: [],
  goals: null,
  dailyProgress: null,
  isLoading: false,
  error: null,

  fetchStreak: async () => {
    try {
      set({ isLoading: true, error: null });
      const streak = await invoke<number>('get_streak');
      set({ streak, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  fetchActivityLog: async () => {
    try {
      set({ isLoading: true, error: null });
      const activityLog = await invoke<ActivityLogItem[]>('get_activity_heatmap');
      set({ activityLog, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  fetchGoals: async () => {
    try {
      set({ isLoading: true, error: null });
      const goals = await invoke<UserGoal>('get_goals');
      set({ goals, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  updateGoals: async (goals: UserGoal) => {
    try {
      set({ isLoading: true, error: null });
      await invoke('set_goals', { goals });
      set({ goals, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  fetchDailyProgress: async () => {
    try {
      set({ isLoading: true, error: null });
      const dailyProgress = await invoke<DailyProgress>('get_daily_progress');
      set({ dailyProgress, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  recordActivity: async (charDiff: number) => {
    try {
      await invoke('record_daily_activity', { charDiff });
      // Refresh streak and daily progress after recording
      await get().fetchStreak();
      await get().fetchDailyProgress();
    } catch (error) {
      set({ error: String(error) });
    }
  }
}));
