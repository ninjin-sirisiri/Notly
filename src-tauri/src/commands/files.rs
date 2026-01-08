use std::sync::Arc;
use tauri::State;

use crate::AppState;
use crate::db::models::FileItem;
use crate::i18n::I18n;
use crate::services::FileService;

#[tauri::command]
pub async fn get_all_files<R: tauri::Runtime>(
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
  locale: Option<String>,
) -> Result<Vec<FileItem>, String> {
  let _i18n = I18n::new(locale.as_deref().unwrap_or("en"));
  let context = state.get_context().map_err(|e| e.to_string())?;
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let file_service = FileService::new(db);
    file_service.get_all_files_hierarchical()
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}
