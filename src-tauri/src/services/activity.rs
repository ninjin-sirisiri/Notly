use rusqlite::{Connection, Result, params};

/// 今日のアクティビティを記録
pub fn record_activity(conn: &Connection) -> Result<()> {
  conn.execute(
    "INSERT OR IGNORE INTO activity_log (activity_date) VALUES (DATE('now', 'localtime'))",
    [],
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
  let mut expected_date = today.clone();

  for date in &dates {
    if date == &expected_date {
      streak += 1;
      // 次に期待する日付(1日前)を計算
      expected_date =
        conn.query_row("SELECT DATE(?, '-1 day')", params![expected_date], |row| {
          row.get(0)
        })?;
    } else {
      break;
    }
  }

  Ok(streak)
}
