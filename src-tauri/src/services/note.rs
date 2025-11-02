use crate::db::models::{Note, NoteWithContent};
use rusqlite::{params, Result as SqlResult};
use std::{path::PathBuf, sync::Arc};

use crate::db::Database;
use std::fs;

pub struct NoteService {
  base_path: PathBuf,
  db: Arc<Database>,
}

impl NoteService {
  pub fn new(db: Arc<Database>, base_path: PathBuf) -> Self {
    NoteService { base_path, db }
  }

  // ノートの作成
  pub fn create_note(
    &self,
    title: String,
    content: String,
    parent_id: Option<i64>,
    folder_path: Option<String>,
  ) -> Result<NoteWithContent, String> {
    let conn = self.db.conn.lock().unwrap();

    let file_path = format!(
      "{}/{}.md",
      folder_path.clone().unwrap_or_default(),
      title.clone()
    );

    conn
      .execute(
        "
		    INSERT INTO notes (title, parent_id, file_path)
		    VALUES (?, ?, ?)
		    ",
        params![title, parent_id, file_path],
      )
      .map_err(|e| format!("ノートの作成に失敗しました: {}", e))?;

    let full_path = self
      .base_path
      .join(folder_path.clone().unwrap_or_default())
      .join(format!("{}.md", title.clone()));

    fs::write(full_path, content).map_err(|e| format!("ノートの作成に失敗しました: {}", e))?;

    let note_id = conn.last_insert_rowid();

    let note = self.get_note_by_id(note_id)?;

    Ok(note)
  }

  // ノートをidで取得
  pub fn get_note_by_id(&self, id: i64) -> Result<NoteWithContent, String> {
    let conn = self.db.conn.lock().unwrap();

    let note = conn
      .query_row(
        "SELECT created_at, updated_at, parent_id FROM notes WHERE id = ?",
        params![id],
        |row| {
          Ok(Note {
            id: row.get(0)?,
            file_path: row.get(1)?,
            title: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
            parent_id: row.get(5)?,
          })
        },
      )
      .map_err(|e| format!("ノートの読み込みに失敗しました: {}", e))?;

    let content = fs::read_to_string(note.file_path.clone())
      .map_err(|e| format!("ノートの読み込みに失敗しました: {}", e))?;

    let note_with_content = NoteWithContent {
      id: note.id,
      file_path: note.file_path,
      title: note.title,
      created_at: note.created_at,
      updated_at: note.updated_at,
      parent_id: note.parent_id,
      content,
    };

    Ok(note_with_content)
  }

  // 全てのノートを取得
  pub fn get_all_notes(&self) -> Result<Vec<Note>, String> {
    let conn = self.db.conn.lock().unwrap();

    let mut stmt = conn
      .prepare(
        "SELECT id, file_path, title, created_at, updated_at, parent_id
        FROM notes ORDER BY updated_at DESC",
      )
      .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let notes = stmt
      .query_map([], |row| {
        Ok(Note {
          id: row.get(0)?,
          file_path: row.get(1)?,
          title: row.get(2)?,
          created_at: row.get(3)?,
          updated_at: row.get(4)?,
          parent_id: row.get(5)?,
        })
      })
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?
      .collect::<SqlResult<Vec<Note>>>()
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?;

    Ok(notes)
  }

  // ノートの更新
  pub fn update_note(
    &self,
    id: i64,
    title: Option<String>,
    content: Option<String>,
  ) -> Result<NoteWithContent, String> {
    let conn = self.db.conn.lock().unwrap();

    let before_title = self.get_note_by_id(id)?.title;

    conn
      .execute(
        "UPDATE notes SET title = ?, WHERE id = ?",
        params![title, id],
      )
      .map_err(|e| format!("ノートの更新に失敗しました: {}", e))?;

    if content.is_some() {
      let full_path = self.base_path.join(title.unwrap_or(before_title));
      fs::write(full_path, content.unwrap())
        .map_err(|e| format!("ノートの更新に失敗しました: {}", e))?;
    }

    self.get_note_by_id(id)
  }

  // ノートの削除
  pub fn delete_note(&self, id: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();

    conn
      .execute("DELETE FROM notes WHERE id = ?", params![id])
      .map_err(|e| format!("ノートの削除に失敗しました: {}", e))?;

    Ok(())
  }
}
