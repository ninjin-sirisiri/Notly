use std::sync::Arc;

use crate::db::models::*;
use crate::services::NoteService;
use tauri::State;

use crate::AppState;

#[tauri::command]
pub async fn create_note<R: tauri::Runtime>(
  input: CreateNoteInput,
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<NoteWithContent, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.create_note(
      input.title,
      input.content,
      input.parent_id,
      input.folder_path,
    )
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn get_all_notes<R: tauri::Runtime>(
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<Vec<Note>, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.get_all_notes()
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn get_note_by_id<R: tauri::Runtime>(
  id: i64,
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<NoteWithContent, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.get_note_by_id(id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn update_note<R: tauri::Runtime>(
  input: UpdateNoteInput,
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<NoteWithContent, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.update_note(input.id, input.title, input.content)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn delete_note<R: tauri::Runtime>(
  id: i64,
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<(), String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.delete_note(id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn move_note<R: tauri::Runtime>(
  input: MoveNoteInput,
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<Note, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.move_note(input.id, input.new_parent_id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn search_notes<R: tauri::Runtime>(
  query: String,
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<Vec<Note>, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.search_notes(&query)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn restore_note<R: tauri::Runtime>(
  id: i64,
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<(), String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.restore_note(id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn permanently_delete_note<R: tauri::Runtime>(
  id: i64,
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<(), String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.permanently_delete_note(id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn get_deleted_notes<R: tauri::Runtime>(
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<Vec<Note>, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.get_deleted_notes()
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn toggle_favorite<R: tauri::Runtime>(
  id: i64,
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<Note, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.toggle_favorite(id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn toggle_favorite_notes<R: tauri::Runtime>(
  ids: Vec<i64>,
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<(), String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.toggle_favorite_notes(ids)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn get_favorite_notes<R: tauri::Runtime>(
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<Vec<Note>, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.get_favorite_notes()
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn import_note<R: tauri::Runtime>(
  file_path: String,
  parent_id: Option<i64>,
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<NoteWithContent, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.import_note(file_path, parent_id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn import_notes<R: tauri::Runtime>(
  file_paths: Vec<String>,
  parent_id: Option<i64>,
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<Vec<NoteWithContent>, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.import_notes(file_paths, parent_id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn update_favorite_order<R: tauri::Runtime>(
  id: i64,
  order: i64,
  state: State<'_, AppState>,
  _app: tauri::AppHandle<R>,
) -> Result<(), String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let notes_dir = std::path::PathBuf::from(&context.config.data_dir).join("notes");
  let db = Arc::clone(&context.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.update_favorite_order(id, order)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}
