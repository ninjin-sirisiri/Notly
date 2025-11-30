use crate::AppState;
use crate::services::activity::{
  ActivityLogItem, DailyProgress, UserGoal, get_activity_log, get_streak_count, get_today_progress,
  get_user_goals, record_activity, update_user_goals,
};
use tauri::State;

#[tauri::command]
pub async fn record_daily_activity(
  state: State<'_, AppState>,
  char_diff: i64,
) -> Result<(), String> {
  let context = state.get_context()?;
  let conn = context.db.conn.lock().map_err(|e| e.to_string())?;
  record_activity(&conn, char_diff).map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
pub async fn get_streak(state: State<'_, AppState>) -> Result<i64, String> {
  let context = state.get_context()?;
  let conn = context.db.conn.lock().map_err(|e| e.to_string())?;
  let streak = get_streak_count(&conn).map_err(|e| e.to_string())?;
  Ok(streak)
}

#[tauri::command]
pub async fn get_activity_heatmap(
  state: State<'_, AppState>,
) -> Result<Vec<ActivityLogItem>, String> {
  let context = state.get_context()?;
  let conn = context.db.conn.lock().map_err(|e| e.to_string())?;
  let logs = get_activity_log(&conn).map_err(|e| e.to_string())?;
  Ok(logs)
}

#[tauri::command]
pub async fn get_goals(state: State<'_, AppState>) -> Result<UserGoal, String> {
  let context = state.get_context()?;
  let conn = context.db.conn.lock().map_err(|e| e.to_string())?;
  let goals = get_user_goals(&conn).map_err(|e| e.to_string())?;
  Ok(goals)
}

#[tauri::command]
pub async fn set_goals(state: State<'_, AppState>, goals: UserGoal) -> Result<(), String> {
  let context = state.get_context()?;
  let conn = context.db.conn.lock().map_err(|e| e.to_string())?;
  update_user_goals(&conn, goals).map_err(|e| e.to_string())?;
  Ok(())
}

#[tauri::command]
pub async fn get_daily_progress(state: State<'_, AppState>) -> Result<DailyProgress, String> {
  let context = state.get_context()?;
  let conn = context.db.conn.lock().map_err(|e| e.to_string())?;
  let progress = get_today_progress(&conn).map_err(|e| e.to_string())?;
  Ok(progress)
}
