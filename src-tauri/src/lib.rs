mod commands;
mod db;
mod services;

use std::sync::Arc;

use db::{Database, migrate};
use tauri::Manager;

pub struct AppState {
  pub db: Arc<Database>,
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
use tauri::test::mock_builder;

pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // データベース初期化
      let app_dir = app.path().app_data_dir()?;
      std::fs::create_dir_all(&app_dir)?;

      let metadata_dir = app_dir.join("metadata");
      std::fs::create_dir_all(&metadata_dir)?;

      let note_dir = app_dir.join("notes");
      std::fs::create_dir_all(&note_dir)?;

      let db_path = metadata_dir.join("app.db");
      let db = Database::new(db_path.to_str().unwrap()).expect("Failed to initialize database");

      // マイグレーション実行
      {
        let conn = db.conn.lock().unwrap();
        migrate(&conn).expect("Failed to run migrations");
      }

      app.manage(AppState { db: Arc::new(db) });

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::note::get_all_notes,
      commands::note::get_note_by_id,
      commands::note::create_note,
      commands::note::update_note,
      commands::note::delete_note,
      commands::folder::get_all_folders,
      commands::folder::get_folder_by_id,
      commands::folder::create_folder,
      commands::folder::update_folder,
      commands::folder::delete_folder,
      commands::files::get_all_files,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[allow(dead_code)]
pub fn setup_test_app() -> tauri::AppHandle<tauri::test::MockRuntime> {
  let app = mock_builder()
    .build(tauri::generate_context!())
    .expect("failed to build mock app");
  let db = Database::new(":memory:").expect("Failed to initialize in-memory database");
  {
    let conn = db.conn.lock().unwrap();
    migrate(&conn).expect("Failed to run migrations");
  }
  app.manage(AppState { db: Arc::new(db) });
  app.handle().clone()
}
