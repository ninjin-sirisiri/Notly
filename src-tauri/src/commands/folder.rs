use std::sync::Arc;

use tauri::{Manager, State};

use crate::{
  AppState,
  db::models::{CreateFolderInput, Folder, MoveFolderInput, UpdateFolderInput},
  services::FolderService,
};

#[tauri::command]
pub async fn create_folder<R: tauri::Runtime>(
  input: CreateFolderInput,
  state: State<'_, AppState>,
  app: tauri::AppHandle<R>,
) -> Result<Folder, String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| format!("ノートディレクトリの取得に失敗しました: {}", e))?
    .join("notes");

  let db = Arc::clone(&state.db);

  tauri::async_runtime::spawn_blocking(move || {
    let folder_service = FolderService::new(db, notes_dir);
    folder_service.create_folder(input.name, input.parent_id, input.parent_path)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn get_all_folders<R: tauri::Runtime>(
  state: State<'_, AppState>,
  app: tauri::AppHandle<R>,
) -> Result<Vec<Folder>, String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| format!("ノートディレクトリの取得に失敗しました: {}", e))?
    .join("notes");

  let db = Arc::clone(&state.db);

  tauri::async_runtime::spawn_blocking(move || {
    let folder_service = FolderService::new(db, notes_dir);
    folder_service.get_all_folders()
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn get_folder_by_id<R: tauri::Runtime>(
  id: i64,
  state: State<'_, AppState>,
  app: tauri::AppHandle<R>,
) -> Result<Folder, String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| format!("ノートディレクトリの取得に失敗しました: {}", e))?
    .join("notes");

  let db = Arc::clone(&state.db);

  tauri::async_runtime::spawn_blocking(move || {
    let folder_service = FolderService::new(db, notes_dir);
    folder_service.get_folder_by_id(id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn update_folder<R: tauri::Runtime>(
  input: UpdateFolderInput,
  state: State<'_, AppState>,
  app: tauri::AppHandle<R>,
) -> Result<Folder, String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| format!("ノートディレクトリの取得に失敗しました: {}", e))?
    .join("notes");

  let db = Arc::clone(&state.db);

  tauri::async_runtime::spawn_blocking(move || {
    let folder_service = FolderService::new(db, notes_dir);
    folder_service.update_folder(input.id, input.name, input.parent_id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn delete_folder<R: tauri::Runtime>(
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
    let folder_service = FolderService::new(db, notes_dir.clone());
    folder_service.delete_folder(id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn move_folder<R: tauri::Runtime>(
  input: MoveFolderInput,
  state: State<'_, AppState>,
  app: tauri::AppHandle<R>,
) -> Result<Folder, String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| format!("ノートディレクトリの取得に失敗しました: {}", e))?
    .join("notes");

  let db = Arc::clone(&state.db);

  tauri::async_runtime::spawn_blocking(move || {
    let folder_service = FolderService::new(db, notes_dir);
    folder_service.move_folder(input.id, input.new_parent_id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn restore_folder<R: tauri::Runtime>(
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
    let folder_service = FolderService::new(db, notes_dir);
    folder_service.restore_folder(id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn permanently_delete_folder<R: tauri::Runtime>(
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
    let folder_service = FolderService::new(db, notes_dir);
    folder_service.permanently_delete_folder(id)
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}

#[tauri::command]
pub async fn get_deleted_folders<R: tauri::Runtime>(
  state: State<'_, AppState>,
  app: tauri::AppHandle<R>,
) -> Result<Vec<Folder>, String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| format!("ノートディレクトリの取得に失敗しました: {}", e))?
    .join("notes");

  let db = Arc::clone(&state.db);

  tauri::async_runtime::spawn_blocking(move || {
    let folder_service = FolderService::new(db, notes_dir);
    folder_service.get_deleted_folders()
  })
  .await
  .map_err(|e| format!("バックグラウンド処理エラー: {}", e))?
}
