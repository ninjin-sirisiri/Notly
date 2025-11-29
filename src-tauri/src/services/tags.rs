use crate::db::Database;
use crate::db::models::{Note, Tag};
use rusqlite::{Result as SqlResult, params};
use std::sync::Arc;

pub struct TagService {
  db: Arc<Database>,
}

impl TagService {
  pub fn new(db: Arc<Database>) -> Self {
    TagService { db }
  }

  pub fn create_tag(&self, name: String, color: Option<String>) -> Result<Tag, String> {
    let conn = self.db.conn.lock().unwrap();
    conn
      .execute(
        "INSERT INTO tags (name, color) VALUES (?, ?)",
        params![name, color],
      )
      .map_err(|e| format!("Failed to create tag: {}", e))?;

    let id = conn.last_insert_rowid();

    let tag = conn
      .query_row(
        "SELECT id, name, color, created_at, updated_at FROM tags WHERE id = ?",
        params![id],
        |row| {
          Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
          })
        },
      )
      .map_err(|e| format!("Failed to fetch created tag: {}", e))?;

    Ok(tag)
  }

  pub fn update_tag(&self, id: i64, name: String, color: Option<String>) -> Result<Tag, String> {
    let conn = self.db.conn.lock().unwrap();
    conn
      .execute(
        "UPDATE tags SET name = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        params![name, color, id],
      )
      .map_err(|e| format!("Failed to update tag: {}", e))?;

    let tag = conn
      .query_row(
        "SELECT id, name, color, created_at, updated_at FROM tags WHERE id = ?",
        params![id],
        |row| {
          Ok(Tag {
            id: row.get(0)?,
            name: row.get(1)?,
            color: row.get(2)?,
            created_at: row.get(3)?,
            updated_at: row.get(4)?,
          })
        },
      )
      .map_err(|e| format!("Failed to fetch updated tag: {}", e))?;

    Ok(tag)
  }

  pub fn delete_tag(&self, id: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();
    conn
      .execute("DELETE FROM tags WHERE id = ?", params![id])
      .map_err(|e| format!("Failed to delete tag: {}", e))?;
    Ok(())
  }

  pub fn get_all_tags(&self) -> Result<Vec<Tag>, String> {
    let conn = self.db.conn.lock().unwrap();
    let mut stmt = conn
      .prepare("SELECT id, name, color, created_at, updated_at FROM tags ORDER BY name ASC")
      .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let tags = stmt
      .query_map([], |row| {
        Ok(Tag {
          id: row.get(0)?,
          name: row.get(1)?,
          color: row.get(2)?,
          created_at: row.get(3)?,
          updated_at: row.get(4)?,
        })
      })
      .map_err(|e| format!("Failed to query tags: {}", e))?
      .collect::<SqlResult<Vec<Tag>>>()
      .map_err(|e| format!("Failed to collect tags: {}", e))?;

    Ok(tags)
  }

  pub fn add_tag_to_note(&self, note_id: i64, tag_id: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();
    conn
      .execute(
        "INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)",
        params![note_id, tag_id],
      )
      .map_err(|e| format!("Failed to add tag to note: {}", e))?;
    Ok(())
  }

  pub fn add_tag_to_notes(&self, note_ids: Vec<i64>, tag_id: i64) -> Result<(), String> {
    let mut conn = self.db.conn.lock().unwrap();
    let tx = conn
      .transaction()
      .map_err(|e| format!("Failed to start transaction: {}", e))?;

    {
      let mut stmt = tx
        .prepare("INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)")
        .map_err(|e| e.to_string())?;
      for note_id in note_ids {
        stmt
          .execute(params![note_id, tag_id])
          .map_err(|e| format!("Failed to add tag to note: {}", e))?;
      }
    }

    tx.commit()
      .map_err(|e| format!("Failed to commit transaction: {}", e))?;
    Ok(())
  }

  pub fn remove_tag_from_note(&self, note_id: i64, tag_id: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();
    conn
      .execute(
        "DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?",
        params![note_id, tag_id],
      )
      .map_err(|e| format!("Failed to remove tag from note: {}", e))?;
    Ok(())
  }

  pub fn get_notes_by_tag(&self, tag_id: i64) -> Result<Vec<Note>, String> {
    let conn = self.db.conn.lock().unwrap();
    let mut stmt = conn.prepare(
      "SELECT n.id, n.title, n.created_at, n.updated_at, n.parent_id, n.file_path, n.preview, n.is_deleted, n.deleted_at, n.is_favorite, n.favorite_order
       FROM notes n
       INNER JOIN note_tags nt ON n.id = nt.note_id
       WHERE nt.tag_id = ? AND n.is_deleted = FALSE
       ORDER BY n.updated_at DESC"
    ).map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let notes = stmt
      .query_map(params![tag_id], |row| {
        Ok(Note {
          id: row.get(0)?,
          title: row.get(1)?,
          created_at: row.get(2)?,
          updated_at: row.get(3)?,
          parent_id: row.get(4)?,
          file_path: row.get(5)?,
          preview: row.get(6)?,
          is_deleted: row.get(7)?,
          deleted_at: row.get(8)?,
          is_favorite: row.get(9)?,
          favorite_order: row.get(10)?,
        })
      })
      .map_err(|e| format!("Failed to query notes: {}", e))?
      .collect::<SqlResult<Vec<Note>>>()
      .map_err(|e| format!("Failed to collect notes: {}", e))?;

    Ok(notes)
  }

  pub fn get_tags_by_note(&self, note_id: i64) -> Result<Vec<Tag>, String> {
    let conn = self.db.conn.lock().unwrap();
    let mut stmt = conn
      .prepare(
        "SELECT t.id, t.name, t.color, t.created_at, t.updated_at
           FROM tags t
           INNER JOIN note_tags nt ON t.id = nt.tag_id
           WHERE nt.note_id = ?
           ORDER BY t.name ASC",
      )
      .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let tags = stmt
      .query_map(params![note_id], |row| {
        Ok(Tag {
          id: row.get(0)?,
          name: row.get(1)?,
          color: row.get(2)?,
          created_at: row.get(3)?,
          updated_at: row.get(4)?,
        })
      })
      .map_err(|e| format!("Failed to query tags: {}", e))?
      .collect::<SqlResult<Vec<Tag>>>()
      .map_err(|e| format!("Failed to collect tags: {}", e))?;

    Ok(tags)
  }
}

#[cfg(test)]
mod tests {
  use super::*;
  use crate::db::migrate;
  use std::sync::Arc;
  use tempfile::TempDir;

  fn setup_test_db() -> (Arc<Database>, TempDir) {
    let temp_dir = TempDir::new().unwrap();
    let db_path = temp_dir.path().join("test.db");
    let db = Database::new(db_path.to_str().unwrap()).unwrap();
    {
      let conn = db.conn.lock().unwrap();
      migrate(&conn).unwrap();
    }
    (Arc::new(db), temp_dir)
  }

  #[test]
  fn test_create_tag() {
    let (db, _temp_dir) = setup_test_db();
    let service = TagService::new(db);

    let result = service.create_tag("テストタグ".to_string(), Some("#FF0000".to_string()));

    assert!(result.is_ok());
    let tag = result.unwrap();
    assert_eq!(tag.name, "テストタグ");
    assert_eq!(tag.color, Some("#FF0000".to_string()));
  }

  #[test]
  fn test_get_all_tags() {
    let (db, _temp_dir) = setup_test_db();
    let service = TagService::new(db);

    service.create_tag("タグ1".to_string(), None).unwrap();
    service.create_tag("タグ2".to_string(), None).unwrap();

    let tags = service.get_all_tags().unwrap();
    // デフォルトで「お気に入り」タグが存在するため、3つになる
    assert!(tags.len() >= 2);
  }

  #[test]
  fn test_update_tag() {
    let (db, _temp_dir) = setup_test_db();
    let service = TagService::new(db);

    let created = service.create_tag("元の名前".to_string(), None).unwrap();

    let result = service.update_tag(
      created.id,
      "新しい名前".to_string(),
      Some("#00FF00".to_string()),
    );
    assert!(result.is_ok());
    let updated = result.unwrap();
    assert_eq!(updated.name, "新しい名前");
    assert_eq!(updated.color, Some("#00FF00".to_string()));
  }

  #[test]
  fn test_delete_tag() {
    let (db, _temp_dir) = setup_test_db();
    let service = TagService::new(db);

    let created = service.create_tag("削除テスト".to_string(), None).unwrap();

    let result = service.delete_tag(created.id);
    assert!(result.is_ok());

    let tags = service.get_all_tags().unwrap();
    // 削除されたタグは含まれない（デフォルトの「お気に入り」タグは残る）
    assert!(!tags.iter().any(|t| t.id == created.id));
  }

  #[test]
  fn test_add_tag_to_note() {
    let (db, temp_dir) = setup_test_db();
    let tag_service = TagService::new(db.clone());
    let note_service =
      crate::services::note::NoteService::new(db.clone(), temp_dir.path().to_path_buf());

    let tag = tag_service
      .create_tag("テストタグ".to_string(), None)
      .unwrap();
    let note = note_service
      .create_note("ノート".to_string(), "内容".to_string(), None, None)
      .unwrap();

    let result = tag_service.add_tag_to_note(note.id, tag.id);
    assert!(result.is_ok());

    let tags = tag_service.get_tags_by_note(note.id).unwrap();
    assert!(tags.iter().any(|t| t.id == tag.id));
  }

  #[test]
  fn test_remove_tag_from_note() {
    let (db, temp_dir) = setup_test_db();
    let tag_service = TagService::new(db.clone());
    let note_service =
      crate::services::note::NoteService::new(db.clone(), temp_dir.path().to_path_buf());

    let tag = tag_service
      .create_tag("テストタグ".to_string(), None)
      .unwrap();
    let note = note_service
      .create_note("ノート".to_string(), "内容".to_string(), None, None)
      .unwrap();

    tag_service.add_tag_to_note(note.id, tag.id).unwrap();
    let result = tag_service.remove_tag_from_note(note.id, tag.id);
    assert!(result.is_ok());

    let tags = tag_service.get_tags_by_note(note.id).unwrap();
    assert!(!tags.iter().any(|t| t.id == tag.id));
  }

  #[test]
  fn test_get_notes_by_tag() {
    let (db, temp_dir) = setup_test_db();
    let tag_service = TagService::new(db.clone());
    let note_service =
      crate::services::note::NoteService::new(db.clone(), temp_dir.path().to_path_buf());

    let tag = tag_service
      .create_tag("テストタグ".to_string(), None)
      .unwrap();
    let note1 = note_service
      .create_note("ノート1".to_string(), "内容1".to_string(), None, None)
      .unwrap();
    let note2 = note_service
      .create_note("ノート2".to_string(), "内容2".to_string(), None, None)
      .unwrap();

    tag_service.add_tag_to_note(note1.id, tag.id).unwrap();
    tag_service.add_tag_to_note(note2.id, tag.id).unwrap();

    let notes = tag_service.get_notes_by_tag(tag.id).unwrap();
    assert_eq!(notes.len(), 2);
  }
}
