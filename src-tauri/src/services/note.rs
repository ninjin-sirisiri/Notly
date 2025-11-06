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
    let full_path = self
      .base_path
      .join(folder_path.clone().unwrap_or_default())
      .join(format!("{}.md", title.clone()));

    if let Some(parent) = full_path.parent() {
      fs::create_dir_all(parent)
        .map_err(|e| format!("ノートディレクトリの作成に失敗しました: {}", e))?;
    }

    let note_id = {
      let conn = self.db.conn.lock().unwrap();
      let file_path_str = full_path.to_str().unwrap_or_default().to_string();

      conn
        .execute(
          "
		    INSERT INTO notes (title, parent_id, file_path)
		    VALUES (?, ?, ?)
		    ",
          params![title, parent_id, file_path_str],
        )
        .map_err(|e| format!("ノートの作成に失敗しました: {}", e))?;
      conn.last_insert_rowid()
    };

    fs::write(&full_path, content.clone())
      .map_err(|e| format!("ノートの作成に失敗しました: {}", e))?;

    let note = self.get_note_by_id(note_id)?;

    Ok(note)
  }

  // ノートをidで取得
  pub fn get_note_by_id(&self, id: i64) -> Result<NoteWithContent, String> {
    let conn = self.db.conn.lock().unwrap();

    let note = conn
      .query_row(
        "SELECT id, title, created_at, updated_at, parent_id, file_path FROM notes WHERE id = ?",
        params![id],
        |row| {
          Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
            parent_id: row.get(4)?,
            file_path: row.get(5)?,
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
        "SELECT id, title, created_at, updated_at, parent_id, file_path
        FROM notes ORDER BY updated_at DESC",
      )
      .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let notes = stmt
      .query_map([], |row| {
        Ok(Note {
          id: row.get(0)?,
          title: row.get(1)?,
          created_at: row.get(2)?,
          updated_at: row.get(3)?,
          parent_id: row.get(4)?,
          file_path: row.get(5)?,
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
    title: String,
    content: String,
  ) -> Result<NoteWithContent, String> {
    let old_note: Note = {
      let conn = self.db.conn.lock().unwrap();
      conn
        .query_row(
          "SELECT id, title, created_at, updated_at, parent_id, file_path FROM notes WHERE id = ?",
          params![id],
          |row| {
            Ok(Note {
              id: row.get(0)?,
              title: row.get(1)?,
              created_at: row.get(2)?,
              updated_at: row.get(3)?,
              parent_id: row.get(4)?,
              file_path: row.get(5)?,
            })
          },
        )
        .map_err(|e| format!("ノートの読み込みに失敗しました: {}", e))?
    };

    let old_path = PathBuf::from(&old_note.file_path);
    let new_path = if let Some(parent) = old_path.parent() {
      parent.join(format!("{}.md", title))
    } else {
      PathBuf::from(format!("{}.md", title))
    };

    if old_path != new_path {
      fs::rename(&old_path, &new_path)
        .map_err(|e| format!("ノートファイルのリネームに失敗しました: {}", e))?;
    }

    let new_path_str = new_path.to_str().unwrap_or_default().to_string();

    let updated_at = {
      let conn = self.db.conn.lock().unwrap();
      conn
        .execute(
          "UPDATE notes SET title = ?, file_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          params![title, new_path_str, id],
        )
        .map_err(|e| format!("ノートの更新に失敗しました: {}", e))?;

      conn
        .query_row(
          "SELECT updated_at FROM notes WHERE id = ?",
          params![id],
          |row| row.get(0),
        )
        .map_err(|e| format!("更新日時の取得に失敗しました: {}", e))?
    };

    fs::write(new_path, content.clone())
      .map_err(|e| format!("ノートの更新に失敗しました: {}", e))?;

    Ok(NoteWithContent {
      id: old_note.id,
      title,
      created_at: old_note.created_at,
      updated_at,
      parent_id: old_note.parent_id,
      file_path: new_path_str.to_string(),
      content,
    })
  }

  // ノートの削除
  pub fn delete_note(&self, id: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();

    let file_path: String = conn
      .query_row(
        "SELECT file_path FROM notes WHERE id = ?",
        params![id],
        |row| row.get(0),
      )
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?;

    fs::remove_file(&file_path)
      .map_err(|e| format!("ノートファイルの削除に失敗しました: {}", e))?;

    conn
      .execute("DELETE FROM notes WHERE id = ?", params![id])
      .map_err(|e| format!("ノートの削除に失敗しました: {}", e))?;

    Ok(())
  }
}
