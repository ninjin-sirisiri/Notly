mod commands;
mod config;
mod db;
mod services;

use chrono::Timelike;
use std::sync::{Arc, Mutex};

use config::AppConfig;
use db::{Database, migrate};
use std::str::FromStr;
use tauri::{Emitter, Manager};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut, ShortcutState};
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
    .plugin(
      tauri_plugin_global_shortcut::Builder::new()
        .with_handler(|app, shortcut, event| {
          if event.state == ShortcutState::Pressed {
            let app_handle = app.clone();
            let shortcut_cloned = *shortcut;

            tauri::async_runtime::spawn(async move {
              let state: tauri::State<AppState> = app_handle.state();
              if let Ok(context) = state.get_context() {
                let hotkeys = {
                  let conn = context.db.conn.lock().unwrap();
                  services::HotkeyService::get_all_hotkeys(&conn).unwrap_or_default()
                };

                for h in hotkeys {
                  if h.enabled
                    && let Ok(s) = Shortcut::from_str(&h.shortcut)
                    && s == shortcut_cloned
                  {
                    match h.action.as_str() {
                      "quick_note" => {
                        if let Some(window) = app_handle.get_webview_window("main") {
                          // Force window to appear
                          if window.is_minimized().unwrap_or(false) {
                            let _ = window.unminimize();
                          }
                          if !window.is_visible().unwrap_or(false) {
                            let _ = window.show();
                          }
                          let _ = window.set_focus();
                          let _ = window.set_always_on_top(true);
                          let _ = window.set_always_on_top(false);

                          // Emit to the specific window instead of global app handle
                          if let Err(e) = window.emit("open-quick-note", ()) {
                            eprintln!("Failed to emit event: {}", e);
                          } else {
                            println!("Emitted open-quick-note event to main window");
                          }
                        } else {
                          eprintln!("Main window not found");
                        }
                      }
                      "toggle_window" => {
                        if let Some(window) = app_handle.get_webview_window("main") {
                          let is_visible = window.is_visible().unwrap_or(false);
                          let is_minimized = window.is_minimized().unwrap_or(false);
                          println!(
                            "Toggle window requested. Visible: {}, Minimized: {}",
                            is_visible, is_minimized
                          );

                          if is_visible && !is_minimized {
                            let _ = window.hide();
                            println!("Window hidden");
                          } else {
                            if is_minimized {
                              let _ = window.unminimize();
                            }
                            if !is_visible {
                              let _ = window.show();
                            }
                            let _ = window.set_focus();
                            let _ = window.set_always_on_top(true);
                            let _ = window.set_always_on_top(false);
                            println!("Window shown and focused");
                          }
                        } else {
                          eprintln!("Main window not found for toggle_window");
                        }
                      }
                      _ => {}
                    }
                  }
                }
              }
            });
          }
        })
        .build(),
    )
    .plugin(tauri_plugin_dialog::init())
    .plugin(tauri_plugin_fs::init())
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

      // Manage BackupService
      if let Some(ctx) = context.as_ref() {
        let backup_service = Arc::new(services::BackupService::new(
          ctx.db.clone(),
          std::path::PathBuf::from(&ctx.config.data_dir),
        ));
        app.manage(backup_service);
      }

      // Start notification checker
      if let Some(ctx) = context {
        let app_handle = app.handle().clone();
        // Register hotkeys
        let ctx_for_hotkeys = ctx.clone();
        let app_handle_for_hotkeys = app_handle.clone();
        tauri::async_runtime::spawn(async move {
          let conn = ctx_for_hotkeys.db.conn.lock().unwrap();
          if let Ok(hotkeys) = services::HotkeyService::get_all_hotkeys(&conn) {
            let shortcut_manager = app_handle_for_hotkeys.global_shortcut();
            for h in hotkeys {
              if h.enabled
                && let Ok(shortcut) = Shortcut::from_str(&h.shortcut)
              {
                let _ = shortcut_manager.register(shortcut);
              }
            }
          }
        });

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
      commands::note::toggle_favorite_notes,
      commands::note::get_favorite_notes,
      commands::note::import_note,
      commands::note::import_notes,
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
      commands::tags::add_tag_to_notes,
      commands::tags::remove_tag_from_note,
      commands::tags::get_notes_by_tag,
      commands::tags::get_tags_by_note,
      commands::notification::get_notification_settings,
      commands::notification::update_notification_settings,
      commands::hotkeys::get_hotkeys,
      commands::hotkeys::update_hotkey,
      commands::assets::save_image,
      commands::template::get_all_templates,
      commands::template::get_template_by_id,
      commands::template::create_template,
      commands::template::update_template,
      commands::template::delete_template,
      commands::backup::create_backup,
      commands::backup::restore_backup,
      commands::backup::read_backup_metadata,
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
