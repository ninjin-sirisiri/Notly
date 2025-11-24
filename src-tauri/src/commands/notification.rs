use crate::AppState;
use crate::services::NotificationService;
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationSettings {
  pub id: i64,
  pub enabled: bool,
  pub notification_time: String,
  pub message: String,
  pub created_at: String,
  pub updated_at: String,
}

#[tauri::command]
pub fn get_notification_settings(state: State<AppState>) -> Result<NotificationSettings, String> {
  let context = state.get_context()?;
  let conn = context.db.conn.lock().unwrap();

  NotificationService::get_settings(&conn)
    .map(|settings| NotificationSettings {
      id: settings.id,
      enabled: settings.enabled,
      notification_time: settings.notification_time,
      message: settings.message,
      created_at: settings.created_at,
      updated_at: settings.updated_at,
    })
    .map_err(|e| e.to_string())
}

#[derive(Debug, Deserialize)]
pub struct UpdateNotificationSettingsInput {
  pub enabled: bool,
  pub notification_time: String,
  pub message: String,
}

#[tauri::command]
pub fn update_notification_settings(
  state: State<AppState>,
  input: UpdateNotificationSettingsInput,
) -> Result<NotificationSettings, String> {
  let context = state.get_context()?;
  let conn = context.db.conn.lock().unwrap();

  NotificationService::update_settings(&conn, input.enabled, input.notification_time, input.message)
    .map(|settings| NotificationSettings {
      id: settings.id,
      enabled: settings.enabled,
      notification_time: settings.notification_time,
      message: settings.message,
      created_at: settings.created_at,
      updated_at: settings.updated_at,
    })
    .map_err(|e| e.to_string())
}
