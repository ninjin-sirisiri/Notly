import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { useStreakStore } from './streak';

// Tauri APIモック
const mockInvoke = mock(() => Promise.resolve(0));

// Tauri APIモジュールをモック
mock.module('@tauri-apps/api/core', () => ({
  invoke: mockInvoke
}));

describe('useStreakStore', () => {
  beforeEach(() => {
    // 各テスト前にストアとモックをリセット
    useStreakStore.setState({
      streak: 0,
      isLoading: false,
      error: null
    });
    mockInvoke.mockClear();
  });

  describe('fetchStreak', () => {
    test('連続日数を正常に取得する', async () => {
      const mockStreak = 7;
      mockInvoke.mockResolvedValue(mockStreak);

      const { fetchStreak } = useStreakStore.getState();
      await fetchStreak();

      const state = useStreakStore.getState();
      expect(state.streak).toBe(mockStreak);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockInvoke).toHaveBeenCalledWith('get_streak');
    });

    test('取得中はisLoadingがtrueになる', async () => {
      mockInvoke.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(5), 100))
      );

      const { fetchStreak } = useStreakStore.getState();
      const promise = fetchStreak();

      expect(useStreakStore.getState().isLoading).toBe(true);

      await promise;
      expect(useStreakStore.getState().isLoading).toBe(false);
    });

    test('エラー時にエラーメッセージを設定する', async () => {
      const errorMessage = 'Failed to fetch streak';
      mockInvoke.mockRejectedValue(new Error(errorMessage));

      const { fetchStreak } = useStreakStore.getState();
      await fetchStreak();

      const state = useStreakStore.getState();
      expect(state.error).toBe(`Error: ${errorMessage}`);
      expect(state.isLoading).toBe(false);
    });
  });

  describe('recordActivity', () => {
    test('アクティビティを記録して連続日数を更新する', async () => {
      const newStreak = 8;
      mockInvoke
        .mockResolvedValueOnce(undefined) // record_daily_activity
        .mockResolvedValueOnce(newStreak); // get_streak

      const { recordActivity } = useStreakStore.getState();
      await recordActivity();

      const state = useStreakStore.getState();
      expect(state.streak).toBe(newStreak);
      expect(state.error).toBeNull();
      expect(mockInvoke).toHaveBeenCalledWith('record_daily_activity', { charDiff: 0 });
      expect(mockInvoke).toHaveBeenCalledWith('get_streak');
      expect(mockInvoke).toHaveBeenCalledTimes(2);
    });

    test('エラー時にエラーメッセージを設定する', async () => {
      const errorMessage = 'Failed to record activity';
      mockInvoke.mockRejectedValue(new Error(errorMessage));

      const { recordActivity } = useStreakStore.getState();
      await recordActivity();

      const state = useStreakStore.getState();
      expect(state.error).toBe(`Error: ${errorMessage}`);
    });

    test('record_daily_activityは成功するがget_streakが失敗する場合', async () => {
      const errorMessage = 'Failed to get streak';
      mockInvoke
        .mockResolvedValueOnce(undefined) // record_daily_activity
        .mockRejectedValueOnce(new Error(errorMessage)); // get_streak

      const { recordActivity } = useStreakStore.getState();
      await recordActivity();

      const state = useStreakStore.getState();
      expect(state.error).toBe(`Error: ${errorMessage}`);
    });
  });
});
