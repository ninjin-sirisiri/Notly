use rusqlite::{Connection, Result, params};
use crate::db::models::Hotkey;

pub struct HotkeyService;

impl HotkeyService {
  pub fn get_all_hotkeys(conn: &Connection) -> Result<Vec<Hotkey>> {
    let mut stmt = conn.prepare("SELECT id, action, shortcut, enabled, created_at, updated_at FROM hotkeys")?;
    let hotkeys = stmt.query_map([], |row| {
      Ok(Hotkey {
        id: row.get(0)?,
        action: row.get(1)?,
        shortcut: row.get(2)?,
        enabled: row.get(3)?,
        created_at: row.get(4)?,
        updated_at: row.get(5)?,
      })
    })?;
    
    let mut result = Vec::new();
    for hotkey in hotkeys {
      result.push(hotkey?);
    }
    Ok(result)
  }

  pub fn get_hotkey_by_action(conn: &Connection, action: &str) -> Result<Option<Hotkey>> {
    let mut stmt = conn.prepare("SELECT id, action, shortcut, enabled, created_at, updated_at FROM hotkeys WHERE action = ?")?;
    let mut rows = stmt.query(params![action])?;
    
    if let Some(row) = rows.next()? {
       Ok(Some(Hotkey {
        id: row.get(0)?,
        action: row.get(1)?,
        shortcut: row.get(2)?,
        enabled: row.get(3)?,
        created_at: row.get(4)?,
        updated_at: row.get(5)?,
      }))
    } else {
      Ok(None)
    }
  }

  pub fn update_hotkey(conn: &Connection, action: &str, shortcut: &str, enabled: bool) -> Result<()> {
    conn.execute(
      "UPDATE hotkeys SET shortcut = ?, enabled = ?, updated_at = CURRENT_TIMESTAMP WHERE action = ?",
      params![shortcut, enabled, action],
    )?;
    Ok(())
  }
}
