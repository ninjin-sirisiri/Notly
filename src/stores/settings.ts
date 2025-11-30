import { create } from 'zustand';

type SettingsStore = {
  isSettingsOpen: boolean;
  setSettingsOpen: (isOpen: boolean) => void;
  toggleSettings: () => void;
};

export const useSettingsStore = create<SettingsStore>(set => ({
  isSettingsOpen: false,
  setSettingsOpen: isOpen => set({ isSettingsOpen: isOpen }),
  toggleSettings: () => set(state => ({ isSettingsOpen: !state.isSettingsOpen }))
}));
