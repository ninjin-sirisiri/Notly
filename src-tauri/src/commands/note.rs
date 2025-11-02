use std::sync::Arc;

use crate::db::models::*;
use crate::services::NoteService;
use tauri::{Manager, State};

use crate::AppState;

#[tauri::command]
pub async fn create_note<R: tauri::Runtime>(
  input: CreateNoteInput,
  state: State<'_, AppState>,
  app: tauri::AppHandle<R>,
) -> Result<NoteWithContent, String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| format!("ノートディレクトリの取得に失敗しました: {}", e))?
    .join("notes");

  let db = Arc::clone(&state.db);

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
  app: tauri::AppHandle<R>,
) -> Result<Vec<Note>, String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| format!("ノートディレクトリの取得に失敗しました: {}", e))?
    .join("notes");

  let db = Arc::clone(&state.db);

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
  app: tauri::AppHandle<R>,
) -> Result<NoteWithContent, String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| format!("ノートディレクトリの取得に失敗しました: {}", e))?
    .join("notes");

  let db = Arc::clone(&state.db);

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
  app: tauri::AppHandle<R>,
) -> Result<NoteWithContent, String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| format!("ノートディレクトリの取得に失敗しました: {}", e))?
    .join("notes");

  let db = Arc::clone(&state.db);

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
  app: tauri::AppHandle<R>,
) -> Result<(), String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| format!("ノートディレクトリの取得に失敗しました: {}", e))?
    .join("notes");

  let db = Arc::clone(&state.db);

  tauri::async_runtime::spawn_blocking(move || {
    let note_service = NoteService::new(db, notes_dir);
    note_service.delete_note(id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}
