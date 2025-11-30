import { create } from 'zustand';
import { invoke } from '@tauri-apps/api/core';

type StreakStore = {
  streak: number;
  isLoading: boolean;
  error: string | null;
  fetchStreak: () => Promise<void>;
  recordActivity: (charDiff?: number) => Promise<void>;
};

export const useStreakStore = create<StreakStore>(set => ({
  streak: 0,
  isLoading: false,
  error: null,

  fetchStreak: async () => {
    set({ isLoading: true, error: null });
    try {
      const streak = await invoke<number>('get_streak');
      set({ streak, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
    }
  },

  recordActivity: async (charDiff = 0) => {
    try {
      await invoke('record_daily_activity', { charDiff });
      // アクティビティ記録後、連続日数を再取得
      const streak = await invoke<number>('get_streak');
      set({ streak });
    } catch (error) {
      set({ error: String(error) });
    }
  }
}));
