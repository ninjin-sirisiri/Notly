use crate::db::models::{Note, NoteWithContent};
use rusqlite::{Result as SqlResult, params};
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

    let file_path_str = full_path.to_str().unwrap_or_default().to_string();

    // 同じパスのノートが既に存在するかチェック
    {
      let conn = self.db.conn.lock().unwrap();
      let exists: bool = conn
        .query_row(
          "SELECT EXISTS(SELECT 1 FROM notes WHERE file_path = ?)",
          params![file_path_str],
          |row| row.get(0),
        )
        .unwrap_or(false);

      if exists {
        return Err(format!(
          "同じパスのノートが既に存在します: {}",
          file_path_str
        ));
      }
    }

    if let Some(parent) = full_path.parent() {
      fs::create_dir_all(parent)
        .map_err(|e| format!("ノートディレクトリの作成に失敗しました: {}", e))?;
    }

    let preview = Self::generate_preview(&content);

    let note_id = {
      let conn = self.db.conn.lock().unwrap();

      conn
        .execute(
          "
		    INSERT INTO notes (title, parent_id, file_path, preview)
		    VALUES (?, ?, ?, ?)
		    ",
          params![title, parent_id, file_path_str, preview],
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
        "SELECT id, title, created_at, updated_at, parent_id, file_path, is_deleted, deleted_at, is_favorite, favorite_order FROM notes WHERE id = ?",
        params![id],
        |row| {
          Ok(Note {
            id: row.get(0)?,
            title: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
            parent_id: row.get(4)?,
            file_path: row.get(5)?,
            preview: String::new(),
            is_deleted: row.get(6)?,
            deleted_at: row.get(7)?,
            is_favorite: row.get(8)?,
            favorite_order: row.get(9)?,
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
      is_deleted: note.is_deleted,
      deleted_at: note.deleted_at,
    };

    Ok(note_with_content)
  }

  pub fn generate_preview(content: &str) -> String {
    let plain_text = content
      .lines()
      .map(|line| line.trim())
      .filter(|line| !line.is_empty())
      .collect::<Vec<&str>>()
      .join(" ");

    // Simple markdown stripping
    let plain_text = plain_text
      .replace("#", "")
      .replace("*", "")
      .replace("-", "")
      .replace("`", "")
      .replace(">", "")
      .replace("[", "")
      .replace("]", "")
      .replace("(", "")
      .replace(")", "");

    let plain_text = plain_text.trim();

    if plain_text.chars().count() > 100 {
      plain_text.chars().take(100).collect::<String>() + "..."
    } else {
      plain_text.to_string()
    }
  }

  // 全てのノートを取得
  pub fn get_all_notes(&self) -> Result<Vec<Note>, String> {
    let conn = self.db.conn.lock().unwrap();

    let mut stmt = conn
      .prepare(
        "SELECT id, title, created_at, updated_at, parent_id, file_path, preview, is_deleted, deleted_at, is_favorite, favorite_order
        FROM notes WHERE is_deleted = FALSE ORDER BY updated_at DESC",
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
          preview: row.get(6)?,
          is_deleted: row.get(7)?,
          deleted_at: row.get(8)?,
          is_favorite: row.get(9)?,
          favorite_order: row.get(10)?,
        })
      })
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?
      .collect::<SqlResult<Vec<Note>>>()
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?;

    Ok(notes)
  }

  pub fn search_notes(&self, query: &str) -> Result<Vec<Note>, String> {
    let all_notes = self.get_all_notes()?;
    let query_lower = query.to_lowercase();

    let mut matched_notes = Vec::new();

    for note in all_notes {
      let title_matches = note.title.to_lowercase().contains(&query_lower);

      let content_matches = if !title_matches {
        fs::read_to_string(&note.file_path)
          .map(|content| content.to_lowercase().contains(&query_lower))
          .unwrap_or(false)
      } else {
        false
      };

      if title_matches || content_matches {
        matched_notes.push(note);
      }
    }

    Ok(matched_notes)
  }

  fn get_relative_link_path(&self, path: &std::path::Path) -> String {
    path
      .strip_prefix(&self.base_path)
      .unwrap_or(path)
      .with_extension("")
      .to_string_lossy()
      .replace("\\", "/")
  }

  fn update_backlinks(
    &self,
    old_path: &std::path::Path,
    new_path: &std::path::Path,
    old_title: &str,
    new_title: &str,
  ) -> Result<(), String> {
    let old_rel = self.get_relative_link_path(old_path);
    let new_rel = self.get_relative_link_path(new_path);

    if old_rel == new_rel && old_title == new_title {
      return Ok(());
    }

    let all_notes = self.get_all_notes()?;

    for note in all_notes {
      let content = match fs::read_to_string(&note.file_path) {
        Ok(c) => c,
        Err(_) => continue,
      };

      let mut new_content = content.clone();

      // Replace [[old_rel]] -> [[new_rel]]
      let old_link_rel = format!("[[{}]]", old_rel);
      let new_link_rel = format!("[[{}]]", new_rel);
      new_content = new_content.replace(&old_link_rel, &new_link_rel);

      // Replace [[old_title]] -> [[new_title]]
      if old_rel != old_title {
        let old_link_title = format!("[[{}]]", old_title);
        let new_link_title = format!("[[{}]]", new_title);
        new_content = new_content.replace(&old_link_title, &new_link_title);
      }

      if new_content != content {
        fs::write(&note.file_path, &new_content)
          .map_err(|e| format!("バックリンクの更新に失敗しました ({}): {}", note.title, e))?;

        let preview = Self::generate_preview(&new_content);
        let conn = self.db.conn.lock().unwrap();
        conn
          .execute(
            "UPDATE notes SET preview = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            params![preview, note.id],
          )
          .map_err(|e| format!("プレビューの更新に失敗しました ({}): {}", note.title, e))?;
      }
    }
    Ok(())
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
          "SELECT id, title, created_at, updated_at, parent_id, file_path, is_deleted, deleted_at, is_favorite, favorite_order FROM notes WHERE id = ?",
          params![id],
          |row| {
            Ok(Note {
              id: row.get(0)?,
              title: row.get(1)?,
              created_at: row.get(2)?,
              updated_at: row.get(3)?,
              parent_id: row.get(4)?,
              file_path: row.get(5)?,
              preview: String::new(),
              is_deleted: row.get(6)?,
              deleted_at: row.get(7)?,
              is_favorite: row.get(8)?,
              favorite_order: row.get(9)?,
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
    let preview = Self::generate_preview(&content);

    let updated_at = {
      let conn = self.db.conn.lock().unwrap();
      conn
        .execute(
          "UPDATE notes SET title = ?, file_path = ?, preview = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          params![title, new_path_str, preview, id],
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

    fs::write(&new_path, content.clone())
      .map_err(|e| format!("ノートの更新に失敗しました: {}", e))?;

    // バックリンクの更新
    self.update_backlinks(&old_path, &new_path, &old_note.title, &title)?;

    Ok(NoteWithContent {
      id: old_note.id,
      title,
      created_at: old_note.created_at,
      updated_at,
      parent_id: old_note.parent_id,
      file_path: new_path_str.to_string(),
      content,
      is_deleted: old_note.is_deleted,
      deleted_at: old_note.deleted_at,
    })
  }

  // ノートの削除 (論理削除)
  pub fn delete_note(&self, id: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();

    conn
      .execute(
        "UPDATE notes SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
        params![id],
      )
      .map_err(|e| format!("ノートの削除に失敗しました: {}", e))?;

    Ok(())
  }

  // ノートの完全削除
  pub fn permanently_delete_note(&self, id: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();

    let file_path: String = conn
      .query_row(
        "SELECT file_path FROM notes WHERE id = ?",
        params![id],
        |row| row.get(0),
      )
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?;

    if PathBuf::from(&file_path).exists() {
      fs::remove_file(&file_path)
        .map_err(|e| format!("ノートファイルの削除に失敗しました: {}", e))?;
    }

    conn
      .execute("DELETE FROM notes WHERE id = ?", params![id])
      .map_err(|e| format!("ノートの削除に失敗しました: {}", e))?;

    Ok(())
  }

  // ノートの復元
  pub fn restore_note(&self, id: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();

    // 親フォルダが存在し、削除されていないか確認
    let parent_id: Option<i64> = conn
      .query_row(
        "SELECT parent_id FROM notes WHERE id = ?",
        params![id],
        |row| row.get(0),
      )
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?;

    let new_parent_id = if let Some(pid) = parent_id {
      let parent_exists: bool = conn
        .query_row(
          "SELECT EXISTS(SELECT 1 FROM folders WHERE id = ? AND is_deleted = FALSE)",
          params![pid],
          |row| row.get(0),
        )
        .unwrap_or(false);
      if parent_exists { Some(pid) } else { None }
    } else {
      None
    };

    conn
      .execute(
        "UPDATE notes SET is_deleted = FALSE, deleted_at = NULL, parent_id = ? WHERE id = ?",
        params![new_parent_id, id],
      )
      .map_err(|e| format!("ノートの復元に失敗しました: {}", e))?;

    Ok(())
  }

  // 削除されたノートの取得
  pub fn get_deleted_notes(&self) -> Result<Vec<Note>, String> {
    let conn = self.db.conn.lock().unwrap();

    let mut stmt = conn
      .prepare(
        "SELECT id, title, created_at, updated_at, parent_id, file_path, preview, is_deleted, deleted_at, is_favorite, favorite_order
        FROM notes WHERE is_deleted = TRUE ORDER BY deleted_at DESC",
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
          preview: row.get(6)?,
          is_deleted: row.get(7)?,
          deleted_at: row.get(8)?,
          is_favorite: row.get(9)?,
          favorite_order: row.get(10)?,
        })
      })
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?
      .collect::<SqlResult<Vec<Note>>>()
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?;

    Ok(notes)
  }

  // ノートの移動
  pub fn move_note(&self, id: i64, new_parent_id: Option<i64>) -> Result<Note, String> {
    let old_note: Note = {
      let conn = self.db.conn.lock().unwrap();
      conn
        .query_row(
          "SELECT id, title, created_at, updated_at, parent_id, file_path, preview, is_deleted, deleted_at, is_favorite, favorite_order FROM notes WHERE id = ?",
          params![id],
          |row| {
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
          },
        )
        .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?
    };

    let new_folder_path = if let Some(parent_id) = new_parent_id {
      let conn = self.db.conn.lock().unwrap();
      let folder_path: String = conn
        .query_row(
          "SELECT folder_path FROM folders WHERE id = ?",
          params![parent_id],
          |row| row.get(0),
        )
        .map_err(|e| format!("親フォルダの取得に失敗しました: {}", e))?;
      PathBuf::from(folder_path)
    } else {
      self.base_path.clone()
    };

    let old_path = PathBuf::from(&old_note.file_path);
    let file_name = old_path
      .file_name()
      .ok_or_else(|| "ファイル名の取得に失敗しました".to_string())?;
    let new_path = new_folder_path.join(file_name);

    if old_path != new_path {
      if let Some(parent) = new_path.parent() {
        fs::create_dir_all(parent)
          .map_err(|e| format!("ディレクトリの作成に失敗しました: {}", e))?;
      }

      fs::rename(&old_path, &new_path)
        .map_err(|e| format!("ノートファイルの移動に失敗しました: {}", e))?;
    }

    let new_path_str = new_path.to_str().unwrap_or_default().to_string();

    let updated_at = {
      let conn = self.db.conn.lock().unwrap();
      conn
        .execute(
          "UPDATE notes SET parent_id = ?, file_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          params![new_parent_id, new_path_str, id],
        )
        .map_err(|e| format!("ノートの移動に失敗しました: {}", e))?;

      conn
        .query_row(
          "SELECT updated_at FROM notes WHERE id = ?",
          params![id],
          |row| row.get(0),
        )
        .map_err(|e| format!("更新日時の取得に失敗しました: {}", e))?
    };

    // バックリンクの更新
    self.update_backlinks(&old_path, &new_path, &old_note.title, &old_note.title)?;

    Ok(Note {
      id: old_note.id,
      title: old_note.title,
      created_at: old_note.created_at,
      updated_at,
      parent_id: new_parent_id,
      file_path: new_path_str,
      preview: old_note.preview,
      is_deleted: old_note.is_deleted,
      deleted_at: old_note.deleted_at,
      is_favorite: old_note.is_favorite,
      favorite_order: old_note.favorite_order,
    })
  }

  // お気に入りのトグル
  pub fn toggle_favorite(&self, id: i64) -> Result<Note, String> {
    let conn = self.db.conn.lock().unwrap();

    // 現在のis_favoriteの状態を取得
    let current_favorite: bool = conn
      .query_row(
        "SELECT is_favorite FROM notes WHERE id = ?",
        params![id],
        |row| row.get(0),
      )
      .map_err(|e| format!("お気に入り状態の取得に失敗しました: {}", e))?;

    let new_favorite = !current_favorite;

    // お気に入りに追加する場合、最大のfavorite_orderを取得して+1
    let favorite_order = if new_favorite {
      let max_order: Option<i64> = conn
        .query_row(
          "SELECT MAX(favorite_order) FROM notes WHERE is_favorite = TRUE",
          [],
          |row| row.get(0),
        )
        .ok()
        .flatten();
      Some(max_order.unwrap_or(0) + 1)
    } else {
      None
    };

    conn
      .execute(
        "UPDATE notes SET is_favorite = ?, favorite_order = ? WHERE id = ?",
        params![new_favorite, favorite_order, id],
      )
      .map_err(|e| format!("お気に入りの更新に失敗しました: {}", e))?;

    // 更新されたノートを取得
    let note = conn
      .query_row(
        "SELECT id, title, created_at, updated_at, parent_id, file_path, preview, is_deleted, deleted_at, is_favorite, favorite_order FROM notes WHERE id = ?",
        params![id],
        |row| {
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
        },
      )
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?;

    Ok(note)
  }

  // お気に入りノート一覧を取得
  pub fn get_favorite_notes(&self) -> Result<Vec<Note>, String> {
    let conn = self.db.conn.lock().unwrap();

    let mut stmt = conn
      .prepare(
        "SELECT id, title, created_at, updated_at, parent_id, file_path, preview, is_deleted, deleted_at, is_favorite, favorite_order
        FROM notes WHERE is_favorite = TRUE AND is_deleted = FALSE ORDER BY favorite_order ASC",
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
          preview: row.get(6)?,
          is_deleted: row.get(7)?,
          deleted_at: row.get(8)?,
          is_favorite: row.get(9)?,
          favorite_order: row.get(10)?,
        })
      })
      .map_err(|e| format!("お気に入りノートの取得に失敗しました: {}", e))?
      .collect::<SqlResult<Vec<Note>>>()
      .map_err(|e| format!("お気に入りノートの取得に失敗しました: {}", e))?;

    Ok(notes)
  }

  // お気に入りの並び順を更新
  pub fn update_favorite_order(&self, id: i64, order: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();

    conn
      .execute(
        "UPDATE notes SET favorite_order = ? WHERE id = ?",
        params![order, id],
      )
      .map_err(|e| format!("並び順の更新に失敗しました: {}", e))?;

    Ok(())
  }
}
