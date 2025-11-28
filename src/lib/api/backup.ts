import { invoke } from '@tauri-apps/api/core';

export type BackupMetadata = {
  version: string;
  created_at: string;
  notes_count: number;
  folders_count: number;
};

/**
 * バックアップを作成
 * @param backupPath バックアップファイルを保存するディレクトリパス
 * @returns 作成されたバックアップファイルのパス
 */
export async function createBackup(backupPath: string): Promise<string> {
  return await invoke<string>('create_backup', { backupPath });
}

/**
 * バックアップから復元
 * @param backupFile 復元するバックアップファイルのパス
 */
export async function restoreBackup(backupFile: string): Promise<void> {
  return await invoke<void>('restore_backup', { backupFile });
}

/**
 * バックアップファイルのメタデータを読み取る
 * @param backupFile バックアップファイルのパス
 * @returns バックアップメタデータ
 */
export async function readBackupMetadata(
  backupFile: string
): Promise<BackupMetadata> {
  return await invoke<BackupMetadata>('read_backup_metadata', { backupFile });
}
