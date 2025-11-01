use std::sync::Arc;

use crate::db::models::*;
use crate::services::NoteService;
use tauri::{Manager, State};

use crate::AppState;

#[tauri::command]
pub fn create_note<R: tauri::Runtime>(
  input: CreateNoteInput,
  state: State<'_, AppState>,
  app: tauri::AppHandle<R>,
) -> Result<NoteWithContent, String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| e.to_string())?
    .join("notes");

  let note_service = NoteService::new(Arc::clone(&state.db), notes_dir);

  let note = note_service.create_note(
    &input.title,
    &input.content,
    input.parent_id,
    input.folder_path,
  )?;

  Ok(note)
}

#[tauri::command]
pub fn get_all_notes(
  state: State<'_, AppState>,
  app: tauri::AppHandle,
) -> Result<Vec<Note>, String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| e.to_string())?
    .join("notes");

  let note_service = NoteService::new(Arc::clone(&state.db), notes_dir);

  let notes = note_service.get_all_notes()?;

  Ok(notes)
}

#[tauri::command]
pub fn get_note_by_id(
  id: i64,
  state: State<'_, AppState>,
  app: tauri::AppHandle,
) -> Result<NoteWithContent, String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| e.to_string())?
    .join("notes");

  let note_service = NoteService::new(Arc::clone(&state.db), notes_dir);

  let note = note_service.get_note_by_id(id)?;

  Ok(note)
}

#[tauri::command]
pub fn update_note(
  input: UpdateNoteInput,
  state: State<'_, AppState>,
  app: tauri::AppHandle,
) -> Result<NoteWithContent, String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| e.to_string())?
    .join("notes");

  let note_service = NoteService::new(Arc::clone(&state.db), notes_dir);

  let note = note_service.update_note(input.id, input.title, input.content)?;

  Ok(note)
}

#[tauri::command]
pub fn delete_note(
  id: i64,
  state: State<'_, AppState>,
  app: tauri::AppHandle,
) -> Result<(), String> {
  let notes_dir = app
    .path()
    .app_data_dir()
    .map_err(|e| e.to_string())?
    .join("notes");

  let note_service = NoteService::new(Arc::clone(&state.db), notes_dir);

  note_service.delete_note(id)?;

  Ok(())
}
