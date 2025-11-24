use chrono::{Local, Timelike};
use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NotificationSettings {
  pub id: i64,
  pub enabled: bool,
  pub notification_time: String,
  pub message: String,
  pub created_at: String,
  pub updated_at: String,
}

pub struct NotificationService;

impl NotificationService {
  pub fn get_settings(conn: &Connection) -> Result<NotificationSettings> {
    let mut stmt = conn.prepare(
      "SELECT id, enabled, notification_time, message, created_at, updated_at 
       FROM notification_settings 
       WHERE id = 1",
    )?;

    let settings = stmt.query_row([], |row| {
      Ok(NotificationSettings {
        id: row.get(0)?,
        enabled: row.get(1)?,
        notification_time: row.get(2)?,
        message: row.get(3)?,
        created_at: row.get(4)?,
        updated_at: row.get(5)?,
      })
    })?;

    Ok(settings)
  }

  pub fn update_settings(
    conn: &Connection,
    enabled: bool,
    notification_time: String,
    message: String,
  ) -> Result<NotificationSettings> {
    conn.execute(
      "UPDATE notification_settings 
       SET enabled = ?, notification_time = ?, message = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = 1",
      params![enabled, notification_time, message],
    )?;

    Self::get_settings(conn)
  }

  pub fn should_notify(conn: &Connection) -> Result<Option<String>> {
    let settings = Self::get_settings(conn)?;

    if !settings.enabled {
      return Ok(None);
    }

    let now = Local::now();
    let current_time = format!("{:02}:{:02}", now.hour(), now.minute());

    if current_time == settings.notification_time {
      Ok(Some(settings.message))
    } else {
      Ok(None)
    }
  }
}
