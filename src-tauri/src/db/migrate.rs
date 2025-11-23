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
