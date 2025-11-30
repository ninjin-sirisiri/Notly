use rusqlite::{Connection, Result, params};
use std::fs;

pub fn migrate(conn: &Connection) -> Result<()> {
  conn.execute(
    "CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    parent_id INTEGER DEFAULT NULL,
    file_path TEXT DEFAULT NULL,
    preview TEXT DEFAULT '',
    FOREIGN KEY (parent_id) REFERENCES folders(id)
	  )",
    [],
  )?;

  // Add preview column if it doesn't exist (for existing databases)
  conn
    .execute("ALTER TABLE notes ADD COLUMN preview TEXT DEFAULT ''", [])
    .ok(); // Ignore error if column already exists

  conn.execute(
    "CREATE TABLE IF NOT EXISTS folders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    parent_id INTEGER DEFAULT NULL,
    folder_path TEXT DEFAULT NULL,
    FOREIGN KEY (parent_id) REFERENCES folders(id)
	  )",
    [],
  )?;

  // Add is_deleted and deleted_at columns to notes
  conn
    .execute(
      "ALTER TABLE notes ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE",
      [],
    )
    .ok();
  conn
    .execute(
      "ALTER TABLE notes ADD COLUMN deleted_at DATETIME DEFAULT NULL",
      [],
    )
    .ok();

  // Add is_favorite and favorite_order columns to notes
  conn
    .execute(
      "ALTER TABLE notes ADD COLUMN is_favorite BOOLEAN DEFAULT FALSE",
      [],
    )
    .ok();
  conn
    .execute(
      "ALTER TABLE notes ADD COLUMN favorite_order INTEGER DEFAULT NULL",
      [],
    )
    .ok();

  // Add is_deleted and deleted_at columns to folders
  conn
    .execute(
      "ALTER TABLE folders ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE",
      [],
    )
    .ok();
  conn
    .execute(
      "ALTER TABLE folders ADD COLUMN deleted_at DATETIME DEFAULT NULL",
      [],
    )
    .ok();

  // Add icon and color columns to folders for customization
  conn
    .execute("ALTER TABLE folders ADD COLUMN icon TEXT DEFAULT NULL", [])
    .ok();
  conn
    .execute("ALTER TABLE folders ADD COLUMN color TEXT DEFAULT NULL", [])
    .ok();

  // Add sort_by and sort_order columns to folders for per-folder sorting
  conn
    .execute(
      "ALTER TABLE folders ADD COLUMN sort_by TEXT DEFAULT NULL",
      [],
    )
    .ok();
  conn
    .execute(
      "ALTER TABLE folders ADD COLUMN sort_order TEXT DEFAULT NULL",
      [],
    )
    .ok();

  conn.execute(
    "CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_date DATE NOT NULL UNIQUE,
    activity_count INTEGER DEFAULT 0,
    char_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )",
    [],
  )?;

  // Add activity_count and char_count columns to activity_log if they don't exist
  conn
    .execute(
      "ALTER TABLE activity_log ADD COLUMN activity_count INTEGER DEFAULT 0",
      [],
    )
    .ok();
  conn
    .execute(
      "ALTER TABLE activity_log ADD COLUMN char_count INTEGER DEFAULT 0",
      [],
    )
    .ok();

  conn.execute(
    "CREATE TABLE IF NOT EXISTS user_goals (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    daily_char_count INTEGER DEFAULT 0,
    daily_note_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )",
    [],
  )?;

  conn.execute(
    "INSERT OR IGNORE INTO user_goals (id, daily_char_count, daily_note_count) VALUES (1, 1000, 0)",
    [],
  )?;

  // Generate previews for existing notes that don't have one
  let mut stmt = conn.prepare("SELECT id, file_path, preview FROM notes")?;
  let notes_to_update: Vec<(i64, String)> = stmt
    .query_map([], |row| {
      let id: i64 = row.get(0)?;
      let file_path: String = row.get(1)?;
      let preview: String = row.get(2)?;

      if preview.is_empty() {
        Ok(Some((id, file_path)))
      } else {
        Ok(None)
      }
    })?
    .filter_map(|r| r.ok().flatten())
    .collect();

  for (id, file_path) in notes_to_update {
    if let Ok(content) = fs::read_to_string(&file_path) {
      let preview = generate_preview(&content);
      conn.execute(
        "UPDATE notes SET preview = ? WHERE id = ?",
        params![preview, id],
      )?;
    }
  }

  conn.execute(
    "CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )",
    [],
  )?;

  conn.execute(
    "CREATE TABLE IF NOT EXISTS note_tags (
    note_id INTEGER,
    tag_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id, tag_id),
    FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    )",
    [],
  )?;

  conn.execute(
    "INSERT OR IGNORE INTO tags (name, color) VALUES (?, ?)",
    params!["お気に入り", "#FFD700"],
  )?;

  // Create notification_settings table
  conn.execute(
    "CREATE TABLE IF NOT EXISTS notification_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    enabled BOOLEAN DEFAULT TRUE,
    notification_time TEXT NOT NULL DEFAULT '09:00',
    message TEXT DEFAULT 'ノートを書く時間です!',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )",
    [],
  )?;

  // Insert default notification settings if not exists
  conn.execute(
    "INSERT OR IGNORE INTO notification_settings (id, enabled, notification_time, message) VALUES (1, TRUE, '09:00', 'ノートを書く時間です!')",
    [],
  )?;

  // Create templates table
  conn.execute(
    "CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )",
    [],
  )?;

  // Create hotkeys table
  conn.execute(
    "CREATE TABLE IF NOT EXISTS hotkeys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT UNIQUE NOT NULL,
    shortcut TEXT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )",
    [],
  )?;

  // Insert default hotkeys
  conn.execute(
    "INSERT OR IGNORE INTO hotkeys (action, shortcut) VALUES 
    ('quick_note', 'CommandOrControl+Shift+N'),
    ('toggle_window', 'CommandOrControl+Shift+Space')",
    [],
  )?;

  // Create backup_settings table
  conn.execute(
    "CREATE TABLE IF NOT EXISTS backup_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    enabled BOOLEAN DEFAULT FALSE,
    frequency TEXT DEFAULT 'daily',
    backup_path TEXT,
    last_backup_at DATETIME,
    max_backups INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )",
    [],
  )?;

  // Insert default backup settings if not exists
  conn.execute(
    "INSERT OR IGNORE INTO backup_settings (id, enabled, frequency, max_backups) 
     VALUES (1, FALSE, 'daily', 10)",
    [],
  )?;

  // Create FTS table for full-text search
  // id is unindexed to allow mapping back to notes table
  conn.execute(
    "CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(id UNINDEXED, title, content, tokenize='trigram')",
    [],
  ).or_else(|_| {
    // Fallback if trigram tokenizer is not available (though it should be in modern sqlite)
    conn.execute(
      "CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(id UNINDEXED, title, content)",
      [],
    )
  })?;

  // Check if FTS table needs population
  let fts_count: i64 = conn
    .query_row("SELECT count(*) FROM notes_fts", [], |row| row.get(0))
    .unwrap_or(0);

  let notes_count: i64 = conn
    .query_row(
      "SELECT count(*) FROM notes WHERE is_deleted = FALSE",
      [],
      |row| row.get(0),
    )
    .unwrap_or(0);

  // If FTS is empty or significantly out of sync, repopulate
  // Note: This is a simple check. Ideally we'd have a more robust sync mechanism.
  if fts_count == 0 && notes_count > 0 {
    let mut stmt =
      conn.prepare("SELECT id, title, file_path FROM notes WHERE is_deleted = FALSE")?;
    let notes_iter = stmt.query_map([], |row| {
      Ok((
        row.get::<_, i64>(0)?,
        row.get::<_, String>(1)?,
        row.get::<_, String>(2)?,
      ))
    })?;

    for (id, title, file_path) in notes_iter.flatten() {
      if let Ok(content) = fs::read_to_string(&file_path) {
        conn
          .execute(
            "INSERT INTO notes_fts (id, title, content) VALUES (?, ?, ?)",
            params![id, title, content],
          )
          .ok(); // Ignore errors for individual notes to allow migration to complete
      }
    }
  }

  // Add indexes for performance optimization
  conn
    .execute(
      "CREATE INDEX IF NOT EXISTS idx_notes_parent_id ON notes(parent_id)",
      [],
    )
    .ok();
  conn
    .execute(
      "CREATE INDEX IF NOT EXISTS idx_notes_is_deleted ON notes(is_deleted)",
      [],
    )
    .ok();
  conn
    .execute(
      "CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON notes(is_favorite)",
      [],
    )
    .ok();
  conn
    .execute(
      "CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at)",
      [],
    )
    .ok();
  conn
    .execute(
      "CREATE INDEX IF NOT EXISTS idx_folders_parent_id ON folders(parent_id)",
      [],
    )
    .ok();
  conn
    .execute(
      "CREATE INDEX IF NOT EXISTS idx_folders_is_deleted ON folders(is_deleted)",
      [],
    )
    .ok();

  Ok(())
}

fn generate_preview(content: &str) -> String {
  let plain_text = content
    .lines()
    .map(|line| line.trim())
    .filter(|line| !line.is_empty())
    .collect::<Vec<&str>>()
    .join(" ");

  // Simple markdown stripping
  let plain_text = plain_text
    .replace("#", "")
    .replace("*", "")
    .replace("-", "")
    .replace("`", "")
    .replace(">", "")
    .replace("[", "")
    .replace("]", "")
    .replace("(", "")
    .replace(")", "");

  let plain_text = plain_text.trim();

  if plain_text.chars().count() > 100 {
    plain_text.chars().take(100).collect::<String>() + "..."
  } else {
    plain_text.to_string()
  }
}
