mod db;

use db::{migrate, Database};
use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .setup(|app| {
      // データベース初期化
      let app_dir = app.path().app_data_dir()?;
      std::fs::create_dir_all(&app_dir)?;

      let db_path = app_dir.join("app.db");
      let db = Database::new(db_path.to_str().unwrap()).expect("Failed to initialize database");

      // マイグレーション実行
      {
        let conn = db.conn.lock().unwrap();
        migrate(&conn).expect("Failed to run migrations");
      }
      Ok(())
    })
    .plugin(tauri_plugin_opener::init())
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
