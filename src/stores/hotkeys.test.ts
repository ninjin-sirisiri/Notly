import { describe, test, expect, beforeEach, mock } from 'bun:test';
import * as hotkeyApi from '../lib/api/hotkeys';
import { type Hotkey } from '../types/hotkeys';
import { useHotkeyStore } from './hotkeys';

// APIモック
const mockGetHotkeys = mock(() => Promise.resolve([]));
const mockUpdateHotkey = mock(() => Promise.resolve());

// APIモジュールをモック
mock.module('../lib/api/hotkeys', () => ({
  getHotkeys: mockGetHotkeys,
  updateHotkey: mockUpdateHotkey
}));

describe('useHotkeyStore', () => {
  beforeEach(() => {
    // 各テスト前にストアとモックをリセット
    useHotkeyStore.setState({
      hotkeys: [],
      isLoading: false,
      error: null
    });
    mockGetHotkeys.mockClear();
    mockUpdateHotkey.mockClear();
  });

  describe('loadHotkeys', () => {
    test('ホットキーを正常に読み込む', async () => {
      const mockHotkeys: Hotkey[] = [
        {
          id: 1,
          action: 'new_note',
          shortcut: 'CommandOrControl+N',
          description: 'Create new note',
          enabled: true
        },
        {
          id: 2,
          action: 'toggle_window',
          shortcut: 'CommandOrControl+Shift+Space',
          description: 'Toggle window',
          enabled: true
        }
      ];

      mockGetHotkeys.mockResolvedValue(mockHotkeys);

      const { loadHotkeys } = useHotkeyStore.getState();
      await loadHotkeys();

      const state = useHotkeyStore.getState();
      expect(state.hotkeys).toEqual(mockHotkeys);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockGetHotkeys).toHaveBeenCalledTimes(1);
    });

    test('読み込み中はisLoadingがtrueになる', async () => {
      mockGetHotkeys.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      const { loadHotkeys } = useHotkeyStore.getState();
      const promise = loadHotkeys();

      // 読み込み中の状態を確認
      expect(useHotkeyStore.getState().isLoading).toBe(true);

      await promise;
      expect(useHotkeyStore.getState().isLoading).toBe(false);
    });

    test('エラー時にエラーメッセージを設定する', async () => {
      const errorMessage = 'Failed to load hotkeys';
      mockGetHotkeys.mockRejectedValue(new Error(errorMessage));

      const { loadHotkeys } = useHotkeyStore.getState();
      await loadHotkeys();

      const state = useHotkeyStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });

    test('エラーがErrorオブジェクトでない場合のエラーメッセージ', async () => {
      mockGetHotkeys.mockRejectedValue('String error');

      const { loadHotkeys } = useHotkeyStore.getState();
      await loadHotkeys();

      const state = useHotkeyStore.getState();
      expect(state.error).toBe('Failed to load hotkeys');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('updateHotkey', () => {
    test('ホットキーを正常に更新する', async () => {
      const initialHotkeys: Hotkey[] = [
        {
          id: 1,
          action: 'new_note',
          shortcut: 'CommandOrControl+N',
          description: 'Create new note',
          enabled: true
        },
        {
          id: 2,
          action: 'toggle_window',
          shortcut: 'CommandOrControl+Shift+Space',
          description: 'Toggle window',
          enabled: true
        }
      ];

      useHotkeyStore.setState({ hotkeys: initialHotkeys });

      const updateInput = {
        action: 'new_note',
        shortcut: 'CommandOrControl+Shift+N',
        enabled: false
      };

      mockUpdateHotkey.mockResolvedValue(undefined);

      const { updateHotkey } = useHotkeyStore.getState();
      await updateHotkey(updateInput);

      const state = useHotkeyStore.getState();
      expect(state.hotkeys[0]).toEqual({
        ...initialHotkeys[0],
        ...updateInput
      });
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(mockUpdateHotkey).toHaveBeenCalledWith(updateInput);
    });

    test('更新中はisLoadingがtrueになる', async () => {
      mockUpdateHotkey.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(undefined), 100))
      );

      const updateInput = {
        action: 'new_note',
        shortcut: 'CommandOrControl+Shift+N',
        enabled: true
      };

      const { updateHotkey } = useHotkeyStore.getState();
      const promise = updateHotkey(updateInput);

      expect(useHotkeyStore.getState().isLoading).toBe(true);

      await promise;
      expect(useHotkeyStore.getState().isLoading).toBe(false);
    });

    test('エラー時にエラーメッセージを設定してthrowする', async () => {
      const errorMessage = 'Failed to update hotkey';
      mockUpdateHotkey.mockRejectedValue(new Error(errorMessage));

      const updateInput = {
        action: 'new_note',
        shortcut: 'CommandOrControl+Shift+N',
        enabled: true
      };

      const { updateHotkey } = useHotkeyStore.getState();

      await expect(updateHotkey(updateInput)).rejects.toThrow(errorMessage);

      const state = useHotkeyStore.getState();
      expect(state.error).toBe(errorMessage);
      expect(state.isLoading).toBe(false);
    });
  });
});
