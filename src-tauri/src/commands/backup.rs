use crate::services::backup::{BackupMetadata, BackupService};
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_backup(
  backup_service: State<'_, Arc<BackupService>>,
  backup_path: String,
) -> Result<String, String> {
  backup_service.create_backup(backup_path)
}

#[tauri::command]
pub async fn restore_backup(
  backup_service: State<'_, Arc<BackupService>>,
  backup_file: String,
) -> Result<(), String> {
  backup_service.restore_backup(backup_file)
}

#[tauri::command]
pub async fn read_backup_metadata(
  backup_service: State<'_, Arc<BackupService>>,
  backup_file: String,
) -> Result<BackupMetadata, String> {
  backup_service.read_backup_metadata(backup_file)
}
