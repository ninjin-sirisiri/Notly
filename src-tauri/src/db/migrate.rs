use rusqlite::{Connection, Result};

pub fn migrate(conn: &Connection) -> Result<()> {
  conn.execute(
    "CREATE TABLE IF NOT EXISTS notes (
    id INT PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    parent_id INT DEFAULT NULL,
    file_path TEXT DEFAULT NULL,
    FOREIGN KEY (parent_id) REFERENCES notes(id)
	  )",
    [],
  )?;

  Ok(())
}
