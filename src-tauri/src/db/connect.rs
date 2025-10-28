use rusqlite::{Connection, Result};
use std::sync::Mutex;

pub struct Database {
  pub conn: Mutex<Connection>,
}

impl Database {
  pub fn new(db_path: &str) -> Result<Self> {
    let conn = Connection::open(db_path)?;
    conn.execute("PRAGMA foreign_keys = ON", [])?;

    Ok(Database {
      conn: Mutex::new(conn),
    })
  }
}
