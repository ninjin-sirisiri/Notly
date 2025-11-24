import { create } from 'zustand';
import { getNotificationSettings, updateNotificationSettings } from '../lib/api/notification';
import {
  type NotificationSettings,
  type UpdateNotificationSettingsInput
} from '../types/notification';

type NotificationStore = {
  settings: NotificationSettings | null;
  isLoading: boolean;
  error: string | null;
  loadSettings: () => Promise<void>;
  updateSettings: (input: UpdateNotificationSettingsInput) => Promise<void>;
};

export const useNotificationStore = create<NotificationStore>(set => ({
  settings: null,
  isLoading: false,
  error: null,

  loadSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const settings = await getNotificationSettings();
      set({ settings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load settings',
        isLoading: false
      });
    }
  },

  updateSettings: async (input: UpdateNotificationSettingsInput) => {
    set({ isLoading: true, error: null });
    try {
      const settings = await updateNotificationSettings(input);
      set({ settings, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update settings',
        isLoading: false
      });
      throw error;
    }
  }
}));
