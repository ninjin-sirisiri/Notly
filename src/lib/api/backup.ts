import { invoke } from '@tauri-apps/api/core';
import { getCurrentLanguage } from '../i18n';

export type BackupMetadata = {
  version: string;
  created_at: string;
  notes_count: number;
  folders_count: number;
};

export type BackupSettings = {
  id: number;
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  backup_path: string | null;
  last_backup_at: string | null;
  max_backups: number;
  created_at: string;
  updated_at: string;
};

export type UpdateBackupSettingsInput = {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  backup_path: string | null;
  max_backups: number;
};

/**
 * バックアップを作成
 * @param backupPath バックアップファイルを保存するディレクトリパス
 * @returns 作成されたバックアップファイルのパス
 */
export async function createBackup(backupPath: string): Promise<string> {
  const locale = getCurrentLanguage();
  return await invoke<string>('create_backup', { backupPath, locale });
}

/**
 * バックアップから復元
 * @param backupFile 復元するバックアップファイルのパス
 */
export async function restoreBackup(backupFile: string): Promise<void> {
  const locale = getCurrentLanguage();
  return await invoke<void>('restore_backup', { backupFile, locale });
}

/**
 * バックアップファイルのメタデータを読み取る
 * @param backupFile バックアップファイルのパス
 * @returns バックアップメタデータ
 */
export async function readBackupMetadata(backupFile: string): Promise<BackupMetadata> {
  const locale = getCurrentLanguage();
  return await invoke<BackupMetadata>('read_backup_metadata', { backupFile, locale });
}

/**
 * 自動バックアップ設定を取得
 */
export async function getBackupSettings(): Promise<BackupSettings> {
  const locale = getCurrentLanguage();
  return await invoke<BackupSettings>('get_backup_settings', { locale });
}

/**
 * 自動バックアップ設定を更新
 */
export async function updateBackupSettings(
  input: UpdateBackupSettingsInput
): Promise<BackupSettings> {
  const locale = getCurrentLanguage();
  return await invoke<BackupSettings>('update_backup_settings', { input, locale });
}
