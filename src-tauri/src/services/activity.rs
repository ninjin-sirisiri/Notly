use rusqlite::{Connection, Result, params};
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ActivityLogItem {
  pub date: String,
  pub count: i64,
  pub level: i32,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserGoal {
  pub daily_char_count: i64,
  pub daily_note_count: i64,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DailyProgress {
  pub char_count: i64,
  pub note_count: i64,
}

/// 今日のアクティビティを記録
pub fn record_activity(conn: &Connection, char_diff: i64) -> Result<()> {
  let today: String = conn.query_row("SELECT DATE('now', 'localtime')", [], |row| row.get(0))?;

  conn.execute(
    "INSERT INTO activity_log (activity_date, activity_count, char_count)
     VALUES (?, 1, MAX(0, ?))
     ON CONFLICT(activity_date) DO UPDATE SET
     activity_count = activity_count + 1,
     char_count = char_count + MAX(0, excluded.char_count)",
    params![today, char_diff],
  )?;
  Ok(())
}

/// 連続日数を計算
pub fn get_streak_count(conn: &Connection) -> Result<i64> {
  // 全てのアクティビティ日付を降順で取得
  let mut stmt =
    conn.prepare("SELECT activity_date FROM activity_log ORDER BY activity_date DESC")?;

  let dates: Vec<String> = stmt
    .query_map([], |row| row.get(0))?
    .collect::<Result<Vec<String>>>()?;

  if dates.is_empty() {
    return Ok(0);
  }

  // 今日の日付を取得
  let today: String = conn.query_row("SELECT DATE('now', 'localtime')", [], |row| row.get(0))?;

  // 最新のアクティビティが今日または昨日でない場合、ストリークは0
  let latest_date = &dates[0];
  let yesterday: String =
    conn.query_row("SELECT DATE('now', 'localtime', '-1 day')", [], |row| {
      row.get(0)
    })?;

  if latest_date != &today && latest_date != &yesterday {
    return Ok(0);
  }

  // 連続日数をカウント
  let mut streak = 0;
  let mut expected_date = if latest_date == &today {
    today.clone()
  } else {
    yesterday.clone()
  };

  for date in &dates {
    if date == &expected_date {
      streak += 1;
      // 次に期待する日付(1日前)を計算
      expected_date =
        conn.query_row("SELECT DATE(?, '-1 day')", params![expected_date], |row| {
          row.get(0)
        })?;
    } else if date > &expected_date {
      // Skip future dates if any (shouldn't happen with ORDER BY DESC but just in case)
      continue;
    } else {
      break;
    }
  }

  Ok(streak)
}

pub fn get_activity_log(conn: &Connection) -> Result<Vec<ActivityLogItem>> {
  let mut stmt = conn.prepare(
        "SELECT activity_date, activity_count FROM activity_log WHERE activity_date >= DATE('now', '-1 year')"
    )?;

  let logs = stmt
    .query_map([], |row| {
      let count: i64 = row.get(1)?;
      let level = if count == 0 {
        0
      } else if count < 5 {
        1
      } else if count < 10 {
        2
      } else if count < 20 {
        3
      } else {
        4
      };

      Ok(ActivityLogItem {
        date: row.get(0)?,
        count,
        level,
      })
    })?
    .collect::<Result<Vec<_>>>()?;

  Ok(logs)
}

pub fn get_user_goals(conn: &Connection) -> Result<UserGoal> {
  conn.query_row(
    "SELECT daily_char_count, daily_note_count FROM user_goals WHERE id = 1",
    [],
    |row| {
      Ok(UserGoal {
        daily_char_count: row.get(0)?,
        daily_note_count: row.get(1)?,
      })
    },
  )
}

pub fn update_user_goals(conn: &Connection, goals: UserGoal) -> Result<()> {
  conn.execute(
        "UPDATE user_goals SET daily_char_count = ?, daily_note_count = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
        params![goals.daily_char_count, goals.daily_note_count]
    )?;
  Ok(())
}

pub fn get_today_progress(conn: &Connection) -> Result<DailyProgress> {
  let today: String = conn.query_row("SELECT DATE('now', 'localtime')", [], |row| row.get(0))?;

  let (char_count, note_count) = conn
    .query_row(
      "SELECT char_count, activity_count FROM activity_log WHERE activity_date = ?",
      params![today],
      |row| Ok((row.get(0)?, row.get(1)?)),
    )
    .unwrap_or((0, 0));

  Ok(DailyProgress {
    char_count,
    note_count,
  })
}
