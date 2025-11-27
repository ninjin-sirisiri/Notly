import { invoke } from '@tauri-apps/api/core';
import { type Hotkey, type UpdateHotkeyInput } from '../../types/hotkeys';

export function getHotkeys(): Promise<Hotkey[]> {
  return invoke('get_hotkeys');
}

export function updateHotkey(input: UpdateHotkeyInput): Promise<void> {
  return invoke('update_hotkey', { input });
}
