use crate::{
  AppContext, AppState,
  config::AppConfig,
  db::{Database, migrate},
};
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, Manager, State};

#[tauri::command]
pub fn check_initialization(state: State<'_, AppState>) -> bool {
  state.context.lock().unwrap().is_some()
}

#[tauri::command]
pub fn initialize_app(
  app: AppHandle,
  state: State<'_, AppState>,
  data_dir: String,
) -> Result<(), String> {
  let base_path = PathBuf::from(&data_dir);
  if !base_path.exists() {
    std::fs::create_dir_all(&base_path).map_err(|e| e.to_string())?;
  }

  // Create notly folder
  let notly_dir = base_path.join("notly");
  std::fs::create_dir_all(&notly_dir).map_err(|e| e.to_string())?;

  let metadata_dir = notly_dir.join("metadata");
  std::fs::create_dir_all(&metadata_dir).map_err(|e| e.to_string())?;

  let note_dir = notly_dir.join("notes");
  std::fs::create_dir_all(&note_dir).map_err(|e| e.to_string())?;

  let db_path = metadata_dir.join("app.db");
  let db = Database::new(db_path.to_str().unwrap()).map_err(|e| e.to_string())?;

  {
    let conn = db.conn.lock().unwrap();
    migrate(&conn).map_err(|e| e.to_string())?;
  }

  // Save config with notly_dir path
  let app_config_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
  let config_path = app_config_dir.join("config.json");
  let config = AppConfig {
    data_dir: notly_dir.to_str().unwrap().to_string(),
  };
  config.save(&config_path)?;

  // Update state
  let context = AppContext {
    db: Arc::new(db),
    config,
  };

  let mut ctx_guard = state.context.lock().unwrap();
  *ctx_guard = Some(Arc::new(context));

  Ok(())
}
