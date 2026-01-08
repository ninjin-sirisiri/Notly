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
  TOGGLE_WINDOW: 'toggle_window'
} as const;

// Note: Labels are now managed through i18n
// Use t('settings.hotkeys.actions.quick_note') and t('settings.hotkeys.actions.toggle_window')
export const HOTKEY_ACTION_LABELS: Record<string, string> = {
  [HOTKEY_ACTIONS.QUICK_NOTE]: 'quick_note',
  [HOTKEY_ACTIONS.TOGGLE_WINDOW]: 'toggle_window'
};
