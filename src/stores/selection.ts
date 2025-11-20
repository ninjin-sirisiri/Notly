import { create } from 'zustand';

type ItemType = 'note' | 'folder';

type SelectedItem = {
  id: number;
  type: ItemType;
};

type SelectionStore = {
  selectionMode: boolean;
  selectedItems: SelectedItem[];

  // Actions
  toggleSelectionMode: () => void;
  enableSelectionMode: () => void;
  disableSelectionMode: () => void;
  toggleSelection: (id: number, type: ItemType) => void;
  toggleSelectionWithChildren: (items: SelectedItem[]) => void;
  isSelected: (id: number, type: ItemType) => boolean;
  clearSelection: () => void;
  selectAll: (items: SelectedItem[]) => void;
  getSelectedByType: (type: ItemType) => number[];
  hasSelection: () => boolean;
};

export const useSelectionStore = create<SelectionStore>((set, get) => ({
  selectionMode: false,
  selectedItems: [],

  toggleSelectionMode: () => {
    const { selectionMode } = get();
    set({
      selectionMode: !selectionMode,
      selectedItems: selectionMode ? get().selectedItems : [] // 選択モードOFF時にクリア
    });
  },

  enableSelectionMode: () => {
    set({ selectionMode: true });
  },

  disableSelectionMode: () => {
    set({ selectionMode: false, selectedItems: [] });
  },

  toggleSelection: (id: number, type: ItemType) => {
    const { selectedItems } = get();
    const exists = selectedItems.some(item => item.id === id && item.type === type);

    if (exists) {
      set({
        selectedItems: selectedItems.filter(item => !(item.id === id && item.type === type))
      });
    } else {
      set({
        selectedItems: [...selectedItems, { id, type }]
      });
    }
  },

  toggleSelectionWithChildren: (items: SelectedItem[]) => {
    const { selectedItems } = get();

    // 全てのアイテムが既に選択されているかチェック
    const allSelected = items.every(item =>
      selectedItems.some(selected => selected.id === item.id && selected.type === item.type)
    );

    if (allSelected) {
      // 全て選択されている場合は、これらのアイテムを選択解除
      set({
        selectedItems: selectedItems.filter(
          selected => !items.some(item => item.id === selected.id && item.type === selected.type)
        )
      });
    } else {
      // 一部または全く選択されていない場合は、全て選択
      const newItems = items.filter(
        item =>
          !selectedItems.some(selected => selected.id === item.id && selected.type === item.type)
      );
      set({
        selectedItems: [...selectedItems, ...newItems]
      });
    }
  },

  isSelected: (id: number, type: ItemType) => {
    const { selectedItems } = get();
    return selectedItems.some(item => item.id === id && item.type === type);
  },

  clearSelection: () => {
    set({ selectedItems: [] });
  },

  selectAll: (items: SelectedItem[]) => {
    set({ selectedItems: items });
  },

  getSelectedByType: (type: ItemType) => {
    const { selectedItems } = get();
    return selectedItems

      .filter(item => item.type === type)

      .map(item => item.id);
  },

  hasSelection: () => get().selectedItems.length > 0
}));
