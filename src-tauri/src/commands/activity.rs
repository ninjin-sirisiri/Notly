use crate::AppState;
use crate::services::activity::{get_streak_count, record_activity};
use tauri::State;

#[tauri::command]
pub async fn record_daily_activity(state: State<'_, AppState>) -> Result<(), String> {
  let context = state.get_context()?;
  let conn = context.db.conn.lock().map_err(|e| e.to_string())?;
  record_activity(&conn).map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
pub async fn get_streak(state: State<'_, AppState>) -> Result<i64, String> {
  let context = state.get_context()?;
  let conn = context.db.conn.lock().map_err(|e| e.to_string())?;
  let streak = get_streak_count(&conn).map_err(|e| e.to_string())?;
  Ok(streak)
}
