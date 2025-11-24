use crate::AppState;
use crate::db::models::*;
use crate::services::TagService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn create_tag(input: CreateTagInput, state: State<'_, AppState>) -> Result<Tag, String> {
  let db = Arc::clone(&state.db);
  tauri::async_runtime::spawn_blocking(move || {
    let tag_service = TagService::new(db);
    tag_service.create_tag(input.name, input.color)
  })
  .await
  .map_err(|e| format!("Background task error: {}", e))?
}

#[tauri::command]
pub async fn update_tag(input: UpdateTagInput, state: State<'_, AppState>) -> Result<Tag, String> {
  let db = Arc::clone(&state.db);
  tauri::async_runtime::spawn_blocking(move || {
    let tag_service = TagService::new(db);
    tag_service.update_tag(input.id, input.name, input.color)
  })
  .await
  .map_err(|e| format!("Background task error: {}", e))?
}

#[tauri::command]
pub async fn delete_tag(id: i64, state: State<'_, AppState>) -> Result<(), String> {
  let db = Arc::clone(&state.db);
  tauri::async_runtime::spawn_blocking(move || {
    let tag_service = TagService::new(db);
    tag_service.delete_tag(id)
  })
  .await
  .map_err(|e| format!("Background task error: {}", e))?
}

#[tauri::command]
pub async fn get_all_tags(state: State<'_, AppState>) -> Result<Vec<Tag>, String> {
  let db = Arc::clone(&state.db);
  tauri::async_runtime::spawn_blocking(move || {
    let tag_service = TagService::new(db);
    tag_service.get_all_tags()
  })
  .await
  .map_err(|e| format!("Background task error: {}", e))?
}

#[tauri::command]
pub async fn add_tag_to_note(
  note_id: i64,
  tag_id: i64,
  state: State<'_, AppState>,
) -> Result<(), String> {
  let db = Arc::clone(&state.db);
  tauri::async_runtime::spawn_blocking(move || {
    let tag_service = TagService::new(db);
    tag_service.add_tag_to_note(note_id, tag_id)
  })
  .await
  .map_err(|e| format!("Background task error: {}", e))?
}

#[tauri::command]
pub async fn remove_tag_from_note(
  note_id: i64,
  tag_id: i64,
  state: State<'_, AppState>,
) -> Result<(), String> {
  let db = Arc::clone(&state.db);
  tauri::async_runtime::spawn_blocking(move || {
    let tag_service = TagService::new(db);
    tag_service.remove_tag_from_note(note_id, tag_id)
  })
  .await
  .map_err(|e| format!("Background task error: {}", e))?
}

#[tauri::command]
pub async fn get_notes_by_tag(
  tag_id: i64,
  state: State<'_, AppState>,
) -> Result<Vec<Note>, String> {
  let db = Arc::clone(&state.db);
  tauri::async_runtime::spawn_blocking(move || {
    let tag_service = TagService::new(db);
    tag_service.get_notes_by_tag(tag_id)
  })
  .await
  .map_err(|e| format!("Background task error: {}", e))?
}

#[tauri::command]
pub async fn get_tags_by_note(
  note_id: i64,
  state: State<'_, AppState>,
) -> Result<Vec<Tag>, String> {
  let db = Arc::clone(&state.db);
  tauri::async_runtime::spawn_blocking(move || {
    let tag_service = TagService::new(db);
    tag_service.get_tags_by_note(note_id)
  })
  .await
  .map_err(|e| format!("Background task error: {}", e))?
}
