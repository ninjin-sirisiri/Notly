use crate::AppState;
use crate::db::models::{Hotkey, UpdateHotkeyInput};
use crate::services::HotkeyService;
use std::str::FromStr;
use tauri::{AppHandle, State};
use tauri_plugin_global_shortcut::GlobalShortcutExt;

#[tauri::command]
pub fn get_hotkeys(state: State<AppState>) -> Result<Vec<Hotkey>, String> {
  let context = state.get_context()?;
  let conn = context.db.conn.lock().unwrap();

  HotkeyService::get_all_hotkeys(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_hotkey(
  app: AppHandle,
  state: State<AppState>,
  input: UpdateHotkeyInput,
) -> Result<(), String> {
  let context = state.get_context()?;
  let conn = context.db.conn.lock().unwrap();

  // Get old setting to unregister
  let old_hotkey =
    HotkeyService::get_hotkey_by_action(&conn, &input.action).map_err(|e| e.to_string())?;

  // Update DB
  HotkeyService::update_hotkey(&conn, &input.action, &input.shortcut, input.enabled)
    .map_err(|e| e.to_string())?;

  // Update Global Shortcut
  let shortcut_manager = app.global_shortcut();

  // Unregister old shortcut if it exists
  if let Some(old) = old_hotkey
    && let Ok(shortcut) = tauri_plugin_global_shortcut::Shortcut::from_str(&old.shortcut)
  {
    let _ = shortcut_manager.unregister(shortcut);
  }

  // Register new shortcut if enabled
  if input.enabled {
    if let Ok(shortcut) = tauri_plugin_global_shortcut::Shortcut::from_str(&input.shortcut) {
      shortcut_manager
        .register(shortcut)
        .map_err(|e| format!("Failed to register shortcut: {}", e))?;
    } else {
      return Err("Invalid shortcut format".to_string());
    }
  }

  Ok(())
}
