import { type FileItem } from '@/types/files';

import { getCurrentLanguage } from '../i18n';
import { safeInvoke } from '../tauri';

export function getAllFiles(): Promise<FileItem[]> {
  const locale = getCurrentLanguage();
  return safeInvoke<FileItem[]>('get_all_files', { locale });
}
