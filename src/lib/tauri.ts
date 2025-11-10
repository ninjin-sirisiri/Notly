import { toast } from 'sonner';

import { invoke } from '@tauri-apps/api/core';

export async function safeInvoke<T>(command: string, args?: Record<string, unknown>): Promise<T> {
  try {
    return await invoke<T>(command, args);
  } catch (error) {
    toast.error(`Command "${command}":`, {
      description: error as string
    });
    throw error;
  }
}
