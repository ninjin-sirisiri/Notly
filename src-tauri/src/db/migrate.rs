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

  conn.execute(
    "CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_date DATE NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )",
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
