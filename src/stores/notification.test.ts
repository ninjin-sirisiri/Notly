import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { type NotificationSettings } from '../types/notification';
import { useNotificationStore } from './notification';

// APIモック
const mockGetNotificationSettings = mock(() => Promise.resolve(null));
const mockUpdateNotificationSettings = mock(() => Promise.resolve(null));

// APIモジュールをモック
mock.module('../lib/api/notification', () => ({
  getNotificationSettings: mockGetNotificationSettings,
  updateNotificationSettings: mockUpdateNotificationSettings
}));

describe('useNotificationStore', () => {
  beforeEach(() => {
    // 各テスト前にストアとモックをリセット
    useNotificationStore.setState({
      settings: null,
      isLoading: false,
      error: null
    });
    mockGetNotificationSettings.mockClear();
    mockUpdateNotificationSettings.mockClear();
  });

  describe('loadSettings', () => {
    test('通知設定を正常に読み込む', async () => {
      const mockSettings: NotificationSettings = {
        id: 1,
        enabled: true,
        showOnStartup: true,
        dailyReminder: true,
        reminderTime: '09:00'
      };

      mockGetNotificationSettings.mockResolvedValue(mockSettings);

      const { loadSettings } = useNotificationStore.getState();
      await loadSettings();

      const state = useNotificationStore.getState();
      expect(state.settings).toEqual(mockSettings);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockGetNotificationSettings).toHaveBeenCalledTimes(1);
    });

    test('読み込み中はisLoadingがtrueになる', async () => {
      mockGetNotificationSettings.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(null), 100))
      );

      const { loadSettings } = useNotificationStore.getState();
      const promise = loadSettings();

      expect(useNotificationStore.getState().isLoading).toBe(true);

      await promise;
      expect(useNotificationStore.getState().isLoading).toBe(false);
    });

    test('エラー時にエラーメッセージを設定する', async () => {
      const errorMessage = 'Failed to load settings';
      mockGetNotificationSettings.mockRejectedValue(new Error(errorMessage));

      const { loadSettings } = useNotificationStore.getState();
      await loadSettings();

      const state = useNotificationStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });

    test('エラーがErrorオブジェクトでない場合のエラーメッセージ', async () => {
      mockGetNotificationSettings.mockRejectedValue('String error');

      const { loadSettings } = useNotificationStore.getState();
      await loadSettings();

      const state = useNotificationStore.getState();
      expect(state.error).toBe('Failed to load settings');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('updateSettings', () => {
    test('通知設定を正常に更新する', async () => {
      const updatedSettings: NotificationSettings = {
        id: 1,
        enabled: false,
        showOnStartup: false,
        dailyReminder: false,
        reminderTime: '10:00'
      };

      mockUpdateNotificationSettings.mockResolvedValue(updatedSettings);

      const updateInput = {
        enabled: false,
        showOnStartup: false,
        dailyReminder: false,
        reminderTime: '10:00'
      };

      const { updateSettings } = useNotificationStore.getState();
      await updateSettings(updateInput);

      const state = useNotificationStore.getState();
      expect(state.settings).toEqual(updatedSettings);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockUpdateNotificationSettings).toHaveBeenCalledWith(updateInput);
    });

    test('更新中はisLoadingがtrueになる', async () => {
      mockUpdateNotificationSettings.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(null), 100))
      );

      const updateInput = {
        enabled: true
      };

      const { updateSettings } = useNotificationStore.getState();
      const promise = updateSettings(updateInput);

      expect(useNotificationStore.getState().isLoading).toBe(true);

      await promise;
      expect(useNotificationStore.getState().isLoading).toBe(false);
    });

    test('エラー時にエラーメッセージを設定してthrowする', async () => {
      const errorMessage = 'Failed to update settings';
      mockUpdateNotificationSettings.mockRejectedValue(new Error(errorMessage));

      const updateInput = {
        enabled: true
      };

      const { updateSettings } = useNotificationStore.getState();

      await expect(updateSettings(updateInput)).rejects.toThrow(errorMessage);

      const state = useNotificationStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });
  });
});
