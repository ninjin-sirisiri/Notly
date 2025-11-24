import { type FileItem } from '@/types/files';

import { safeInvoke } from '../tauri';

export function getAllFiles(): Promise<FileItem[]> {
  return safeInvoke<FileItem[]>('get_all_files');
}
