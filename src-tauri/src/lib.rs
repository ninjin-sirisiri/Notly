mod commands;
mod config;
mod db;
mod services;

use chrono::Timelike;
use std::sync::{Arc, Mutex};

use config::AppConfig;
use db::{Database, migrate};
use tauri::Manager;
use tauri_plugin_notification::NotificationExt;

pub struct AppContext {
  pub db: Arc<Database>,
  pub config: AppConfig,
}

pub struct AppState {
  pub context: Mutex<Option<Arc<AppContext>>>,
}

impl AppState {
  pub fn get_context(&self) -> Result<Arc<AppContext>, String> {
    self
      .context
      .lock()
      .unwrap()
      .clone()
      .ok_or_else(|| "App not initialized".to_string())
  }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_notification::init())
    .setup(|app| {
      let app_dir = app.path().app_data_dir()?;
      std::fs::create_dir_all(&app_dir)?;

      let config_path = app_dir.join("config.json");
      let context = if let Some(config) = AppConfig::load(&config_path) {
        let path = std::path::PathBuf::from(&config.data_dir);
        let metadata_dir = path.join("metadata");
        let db_path = metadata_dir.join("app.db");

        if let Ok(db) = Database::new(db_path.to_str().unwrap()) {
          {
            let conn = db.conn.lock().unwrap();
            if let Err(e) = migrate(&conn) {
              eprintln!("Migration failed: {}", e);
            }
          }
          Some(Arc::new(AppContext {
            db: Arc::new(db),
            config,
          }))
        } else {
          None
        }
      } else {
        None
      };

      app.manage(AppState {
        context: Mutex::new(context.clone()),
      });

      // Start notification checker
      if let Some(ctx) = context {
        let app_handle = app.handle().clone();
        std::thread::spawn(move || {
          let mut last_notified_minute = None;
          loop {
            std::thread::sleep(std::time::Duration::from_secs(30));

            let conn = ctx.db.conn.lock().unwrap();
            if let Ok(Some(message)) = services::NotificationService::should_notify(&conn) {
              let now = chrono::Local::now();
              let current_minute = (now.hour(), now.minute());

              // Only notify once per minute
              if last_notified_minute != Some(current_minute) {
                last_notified_minute = Some(current_minute);

                let _ = app_handle
                  .notification()
                  .builder()
                  .title("Notly")
                  .body(&message)
                  .show();
              }
            }
          }
        });
      }

      Ok(())
    })
    .invoke_handler(tauri::generate_handler![
      commands::app::check_initialization,
      commands::app::initialize_app,
      commands::note::get_all_notes,
      commands::note::get_note_by_id,
      commands::note::create_note,
      commands::note::update_note,
      commands::note::delete_note,
      commands::note::move_note,
      commands::note::search_notes,
      commands::note::restore_note,
      commands::note::permanently_delete_note,
      commands::note::get_deleted_notes,
      commands::note::toggle_favorite,
      commands::note::get_favorite_notes,
      commands::note::update_favorite_order,
      commands::folder::get_all_folders,
      commands::folder::get_folder_by_id,
      commands::folder::create_folder,
      commands::folder::update_folder,
      commands::folder::delete_folder,
      commands::folder::move_folder,
      commands::folder::restore_folder,
      commands::folder::permanently_delete_folder,
      commands::folder::get_deleted_folders,
      commands::files::get_all_files,
      commands::activity::record_daily_activity,
      commands::activity::get_streak,
      commands::tags::create_tag,
      commands::tags::update_tag,
      commands::tags::delete_tag,
      commands::tags::get_all_tags,
      commands::tags::add_tag_to_note,
      commands::tags::remove_tag_from_note,
      commands::tags::get_notes_by_tag,
      commands::tags::get_tags_by_note,
      commands::notification::get_notification_settings,
      commands::notification::update_notification_settings,
      commands::assets::save_image,
    ])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[allow(dead_code)]
pub fn setup_test_app() -> tauri::AppHandle<tauri::test::MockRuntime> {
  use tauri::test::mock_builder;
  let app = mock_builder()
    .build(tauri::generate_context!())
    .expect("failed to build mock app");
  let db = Database::new(":memory:").expect("Failed to initialize in-memory database");
  {
    let conn = db.conn.lock().unwrap();
    migrate(&conn).expect("Failed to run migrations");
  }
  let config = AppConfig {
    data_dir: ".".to_string(),
  };
  let context = AppContext {
    db: Arc::new(db),
    config,
  };
  app.manage(AppState {
    context: Mutex::new(Some(Arc::new(context))),
  });
  app.handle().clone()
}
