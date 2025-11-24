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
