use rusqlite::{Connection, Result};

pub fn migrate(conn: &Connection) -> Result<()> {
  conn.execute(
    "CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    parent_id INTEGER DEFAULT NULL,
    file_path TEXT DEFAULT NULL,
    FOREIGN KEY (parent_id) REFERENCES folders(id)
	  )",
    [],
  )?;

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

  conn.execute(
    "CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    activity_date DATE NOT NULL UNIQUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )",
    [],
  )?;

  Ok(())
}
