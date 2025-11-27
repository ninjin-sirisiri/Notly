use crate::AppState;
use crate::db::models::{CreateTemplateInput, Template, UpdateTemplateInput};
use crate::services::TemplateService;
use std::sync::Arc;
use tauri::State;

#[tauri::command]
pub async fn get_all_templates(state: State<'_, AppState>) -> Result<Vec<Template>, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let db = Arc::clone(&context.db);
  tauri::async_runtime::spawn_blocking(move || {
    let template_service = TemplateService::new(db);
    template_service.get_all_templates()
  })
  .await
  .map_err(|e| format!("Background task error: {}", e))?
}

#[tauri::command]
pub async fn get_template_by_id(id: i64, state: State<'_, AppState>) -> Result<Template, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let db = Arc::clone(&context.db);
  tauri::async_runtime::spawn_blocking(move || {
    let template_service = TemplateService::new(db);
    template_service.get_template_by_id(id)
  })
  .await
  .map_err(|e| format!("Background task error: {}", e))?
}

#[tauri::command]
pub async fn create_template(
  input: CreateTemplateInput,
  state: State<'_, AppState>,
) -> Result<Template, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let db = Arc::clone(&context.db);
  tauri::async_runtime::spawn_blocking(move || {
    let template_service = TemplateService::new(db);
    template_service.create_template(input)
  })
  .await
  .map_err(|e| format!("Background task error: {}", e))?
}

#[tauri::command]
pub async fn update_template(
  input: UpdateTemplateInput,
  state: State<'_, AppState>,
) -> Result<Template, String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let db = Arc::clone(&context.db);
  tauri::async_runtime::spawn_blocking(move || {
    let template_service = TemplateService::new(db);
    template_service.update_template(input)
  })
  .await
  .map_err(|e| format!("Background task error: {}", e))?
}

#[tauri::command]
pub async fn delete_template(id: i64, state: State<'_, AppState>) -> Result<(), String> {
  let context = state.get_context().map_err(|e| e.to_string())?;
  let db = Arc::clone(&context.db);
  tauri::async_runtime::spawn_blocking(move || {
    let template_service = TemplateService::new(db);
    template_service.delete_template(id)
  })
  .await
  .map_err(|e| format!("Background task error: {}", e))?
}
