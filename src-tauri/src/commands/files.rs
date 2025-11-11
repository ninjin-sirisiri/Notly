use std::sync::Arc;
use tauri::State;

use crate::AppState;
use crate::db::models::FileItem;
use crate::services::FileService;

#[tauri::command]
pub async fn get_all_files<R: tauri::Runtime>(
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<Vec<FileItem>, String> {
  let db = Arc::clone(&state.db);

  tauri::async_runtime::spawn_blocking(move || {
    let file_service = FileService::new(db);
    file_service.get_all_files_hierarchical()
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}
