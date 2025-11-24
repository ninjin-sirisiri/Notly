import { invoke } from '@tauri-apps/api/core';

export async function checkInitialization(): Promise<boolean> {
  return await invoke('check_initialization');
}

export async function initializeApp(dataDir: string): Promise<void> {
  return await invoke('initialize_app', { dataDir });
}
