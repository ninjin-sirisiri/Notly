export type Hotkey = {
  id: number;
  action: string;
  shortcut: string;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
};

export type UpdateHotkeyInput = {
  action: string;
  shortcut: string;
  enabled: boolean;
};

export const HOTKEY_ACTIONS = {
  QUICK_NOTE: 'quick_note',
  TOGGLE_WINDOW: 'toggle_window',
} as const;

export const HOTKEY_ACTION_LABELS: Record<string, string> = {
  [HOTKEY_ACTIONS.QUICK_NOTE]: 'クイックノート作成',
  [HOTKEY_ACTIONS.TOGGLE_WINDOW]: 'ウィンドウの表示/非表示',
};
