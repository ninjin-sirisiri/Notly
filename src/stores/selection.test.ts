import { describe, test, expect, beforeEach } from 'bun:test';
import { useSelectionStore } from './selection';

describe('useSelectionStore', () => {
  beforeEach(() => {
    // 各テスト前にストアをリセット
    useSelectionStore.setState({
      selectionMode: false,
      selectedItems: []
    });
  });

  describe('toggleSelectionMode', () => {
    test('選択モードを切り替える', () => {
      const { toggleSelectionMode, selectionMode } = useSelectionStore.getState();
      expect(selectionMode).toBe(false);

      toggleSelectionMode();
      expect(useSelectionStore.getState().selectionMode).toBe(true);

      toggleSelectionMode();
      expect(useSelectionStore.getState().selectionMode).toBe(false);
    });

    test('選択モードOFF時に選択項目をクリアする', () => {
      const { toggleSelectionMode, toggleSelection } = useSelectionStore.getState();

      // 選択モードをONにして項目を選択
      toggleSelectionMode();
      toggleSelection(1, 'note');
      toggleSelection(2, 'folder');
      expect(useSelectionStore.getState().selectedItems).toHaveLength(2);

      // 選択モードをOFFにする
      toggleSelectionMode();
      expect(useSelectionStore.getState().selectedItems).toHaveLength(2);
    });
  });

  describe('enableSelectionMode', () => {
    test('選択モードを有効にする', () => {
      const { enableSelectionMode } = useSelectionStore.getState();
      enableSelectionMode();
      expect(useSelectionStore.getState().selectionMode).toBe(true);
    });
  });

  describe('disableSelectionMode', () => {
    test('選択モードを無効にして選択項目をクリアする', () => {
      const { enableSelectionMode, toggleSelection, disableSelectionMode } =
        useSelectionStore.getState();

      enableSelectionMode();
      toggleSelection(1, 'note');
      toggleSelection(2, 'folder');
      expect(useSelectionStore.getState().selectedItems).toHaveLength(2);

      disableSelectionMode();
      expect(useSelectionStore.getState().selectionMode).toBe(false);
      expect(useSelectionStore.getState().selectedItems).toHaveLength(0);
    });
  });

  describe('toggleSelection', () => {
    test('項目を選択する', () => {
      const { toggleSelection } = useSelectionStore.getState();

      toggleSelection(1, 'note');
      expect(useSelectionStore.getState().selectedItems).toEqual([{ id: 1, type: 'note' }]);

      toggleSelection(2, 'folder');
      expect(useSelectionStore.getState().selectedItems).toEqual([
        { id: 1, type: 'note' },
        { id: 2, type: 'folder' }
      ]);
    });

    test('選択済みの項目を選択解除する', () => {
      const { toggleSelection } = useSelectionStore.getState();

      toggleSelection(1, 'note');
      toggleSelection(2, 'folder');
      expect(useSelectionStore.getState().selectedItems).toHaveLength(2);

      toggleSelection(1, 'note');
      expect(useSelectionStore.getState().selectedItems).toEqual([{ id: 2, type: 'folder' }]);
    });
  });

  describe('toggleSelectionWithChildren', () => {
    test('全てのアイテムが未選択の場合、全て選択する', () => {
      const { toggleSelectionWithChildren } = useSelectionStore.getState();

      const items = [
        { id: 1, type: 'note' as const },
        { id: 2, type: 'note' as const },
        { id: 3, type: 'folder' as const }
      ];

      toggleSelectionWithChildren(items);
      expect(useSelectionStore.getState().selectedItems).toEqual(items);
    });

    test('一部のアイテムが選択済みの場合、全て選択する', () => {
      const { toggleSelection, toggleSelectionWithChildren } = useSelectionStore.getState();

      toggleSelection(1, 'note');

      const items = [
        { id: 1, type: 'note' as const },
        { id: 2, type: 'note' as const },
        { id: 3, type: 'folder' as const }
      ];

      toggleSelectionWithChildren(items);
      expect(useSelectionStore.getState().selectedItems).toEqual(items);
    });

    test('全てのアイテムが選択済みの場合、全て選択解除する', () => {
      const { toggleSelectionWithChildren } = useSelectionStore.getState();

      const items = [
        { id: 1, type: 'note' as const },
        { id: 2, type: 'note' as const },
        { id: 3, type: 'folder' as const }
      ];

      // 最初に全て選択
      toggleSelectionWithChildren(items);
      expect(useSelectionStore.getState().selectedItems).toEqual(items);

      // 再度実行して全て選択解除
      toggleSelectionWithChildren(items);
      expect(useSelectionStore.getState().selectedItems).toEqual([]);
    });
  });

  describe('isSelected', () => {
    test('項目が選択されているか確認する', () => {
      const { toggleSelection, isSelected } = useSelectionStore.getState();

      expect(isSelected(1, 'note')).toBe(false);

      toggleSelection(1, 'note');
      expect(isSelected(1, 'note')).toBe(true);
      expect(isSelected(2, 'note')).toBe(false);
      expect(isSelected(1, 'folder')).toBe(false);
    });
  });

  describe('clearSelection', () => {
    test('全ての選択項目をクリアする', () => {
      const { toggleSelection, clearSelection } = useSelectionStore.getState();

      toggleSelection(1, 'note');
      toggleSelection(2, 'folder');
      expect(useSelectionStore.getState().selectedItems).toHaveLength(2);

      clearSelection();
      expect(useSelectionStore.getState().selectedItems).toHaveLength(0);
    });
  });

  describe('selectAll', () => {
    test('指定された全ての項目を選択する', () => {
      const { selectAll } = useSelectionStore.getState();

      const items = [
        { id: 1, type: 'note' as const },
        { id: 2, type: 'note' as const },
        { id: 3, type: 'folder' as const }
      ];

      selectAll(items);
      expect(useSelectionStore.getState().selectedItems).toEqual(items);
    });
  });

  describe('getSelectedByType', () => {
    test('指定されたタイプの選択項目のIDを取得する', () => {
      const { toggleSelection, getSelectedByType } = useSelectionStore.getState();

      toggleSelection(1, 'note');
      toggleSelection(2, 'note');
      toggleSelection(3, 'folder');

      expect(getSelectedByType('note')).toEqual([1, 2]);
      expect(getSelectedByType('folder')).toEqual([3]);
    });
  });

  describe('hasSelection', () => {
    test('選択項目があるか確認する', () => {
      const { toggleSelection, hasSelection } = useSelectionStore.getState();

      expect(hasSelection()).toBe(false);

      toggleSelection(1, 'note');
      expect(hasSelection()).toBe(true);
    });
  });
});
