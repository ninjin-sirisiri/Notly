use crate::db::models::{BackupSettings, UpdateBackupSettingsInput};
use crate::i18n::I18n;
use crate::services::backup::{BackupMetadata, BackupService};
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_backup(
  backup_service: State<'_, Arc<BackupService>>,
  backup_path: String,
  locale: Option<String>,
) -> Result<String, String> {
  let _i18n = I18n::new(locale.as_deref().unwrap_or("en"));
  backup_service.create_backup(backup_path)
}

#[tauri::command]
pub async fn restore_backup(
  backup_service: State<'_, Arc<BackupService>>,
  backup_file: String,
  locale: Option<String>,
) -> Result<(), String> {
  let _i18n = I18n::new(locale.as_deref().unwrap_or("en"));
  backup_service.restore_backup(backup_file)
}

#[tauri::command]
pub async fn read_backup_metadata(
  backup_service: State<'_, Arc<BackupService>>,
  backup_file: String,
  locale: Option<String>,
) -> Result<BackupMetadata, String> {
  let _i18n = I18n::new(locale.as_deref().unwrap_or("en"));
  backup_service.read_backup_metadata(backup_file)
}

#[tauri::command]
pub async fn get_backup_settings(
  backup_service: State<'_, Arc<BackupService>>,
  locale: Option<String>,
) -> Result<BackupSettings, String> {
  let _i18n = I18n::new(locale.as_deref().unwrap_or("en"));
  backup_service.get_backup_settings()
}

#[tauri::command]
pub async fn update_backup_settings(
  backup_service: State<'_, Arc<BackupService>>,
  input: UpdateBackupSettingsInput,
  locale: Option<String>,
) -> Result<BackupSettings, String> {
  let _i18n = I18n::new(locale.as_deref().unwrap_or("en"));
  backup_service.update_backup_settings(input)
}
