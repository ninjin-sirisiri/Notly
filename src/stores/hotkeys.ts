import { create } from 'zustand';
import { getHotkeys, updateHotkey } from '../lib/api/hotkeys';
import { type Hotkey, type UpdateHotkeyInput } from '../types/hotkeys';

type HotkeyStore = {
  hotkeys: Hotkey[];
  isLoading: boolean;
  error: string | null;
  loadHotkeys: () => Promise<void>;
  updateHotkey: (input: UpdateHotkeyInput) => Promise<void>;
};

export const useHotkeyStore = create<HotkeyStore>((set, get) => ({
  hotkeys: [],
  isLoading: false,
  error: null,

  loadHotkeys: async () => {
    set({ isLoading: true, error: null });
    try {
      const hotkeys = await getHotkeys();
      set({ hotkeys, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load hotkeys',
        isLoading: false
      });
    }
  },

  updateHotkey: async (input: UpdateHotkeyInput) => {
    set({ isLoading: true, error: null });
    try {
      await updateHotkey(input);
      const currentHotkeys = get().hotkeys;
      const updatedHotkeys = currentHotkeys.map(h =>
        h.action === input.action ? { ...h, ...input } : h
      );
      set({ hotkeys: updatedHotkeys, isLoading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update hotkey',
        isLoading: false
      });
      throw error;
    }
  }
}));
