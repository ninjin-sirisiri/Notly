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

    // 同じパスのノートが既に存在するかチェック（削除されていないもののみ）
    {
      let conn = self.db.conn.lock().unwrap();
      let exists: bool = conn
        .query_row(
          "SELECT EXISTS(SELECT 1 FROM notes WHERE file_path = ? AND is_deleted = FALSE)",
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
      let id = conn.last_insert_rowid();

      // Update FTS index
      conn
        .execute(
          "INSERT INTO notes_fts (id, title, content) VALUES (?, ?, ?)",
          params![id, title, content],
        )
        .map_err(|e| format!("検索インデックスの更新に失敗しました: {}", e))?;

      id
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
        "SELECT n.id, n.title, n.created_at, n.updated_at, n.parent_id, n.file_path, n.is_deleted, n.deleted_at,
        EXISTS(SELECT 1 FROM note_tags nt JOIN tags t ON nt.tag_id = t.id WHERE nt.note_id = n.id AND t.name = 'お気に入り') as is_favorite
        FROM notes n WHERE n.id = ?",
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
            favorite_order: None,
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
        "SELECT n.id, n.title, n.created_at, n.updated_at, n.parent_id, n.file_path, n.preview, n.is_deleted, n.deleted_at,
        EXISTS(SELECT 1 FROM note_tags nt JOIN tags t ON nt.tag_id = t.id WHERE nt.note_id = n.id AND t.name = 'お気に入り') as is_favorite
        FROM notes n WHERE n.is_deleted = FALSE ORDER BY n.updated_at DESC",
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
          favorite_order: None,
        })
      })
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?
      .collect::<SqlResult<Vec<Note>>>()
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?;

    Ok(notes)
  }

  pub fn search_notes(&self, query: &str) -> Result<Vec<Note>, String> {
    // 1. Parse Query
    let mut text_parts = Vec::new();
    let mut tags = Vec::new();
    let mut is_favorite = None;

    for part in query.split_whitespace() {
      if let Some(tag_name) = part.strip_prefix("tag:") {
        tags.push(tag_name.to_string());
      } else if part == "is:favorite" {
        is_favorite = Some(true);
      } else if part == "-is:favorite" {
        is_favorite = Some(false);
      } else {
        text_parts.push(part);
      }
    }
    let text_query = text_parts.join(" ");

    // 2. Fetch all notes (base candidates)
    let mut candidates = self.get_all_notes()?;

    // 3. Filter by is_favorite
    if let Some(fav) = is_favorite {
      candidates.retain(|n| n.is_favorite == fav);
    }

    // 4. Filter by tags
    if !tags.is_empty() {
      let conn = self.db.conn.lock().unwrap();
      // Construct SQL to find IDs that have ALL tags
      let placeholders = tags.iter().map(|_| "?").collect::<Vec<_>>().join(",");
      let sql = format!(
        "SELECT nt.note_id FROM note_tags nt
              JOIN tags t ON nt.tag_id = t.id
              WHERE t.name IN ({})
              GROUP BY nt.note_id
              HAVING COUNT(DISTINCT t.name) = ?",
        placeholders
      );

      let mut params: Vec<&dyn rusqlite::ToSql> =
        tags.iter().map(|t| t as &dyn rusqlite::ToSql).collect();
      let count = tags.len() as i64;
      params.push(&count);

      let mut stmt = conn.prepare(&sql).map_err(|e| e.to_string())?;
      let valid_ids: std::collections::HashSet<i64> = stmt
        .query_map(params.as_slice(), |row| row.get(0))
        .map_err(|e| e.to_string())?
        .collect::<SqlResult<_>>()
        .map_err(|e| e.to_string())?;

      candidates.retain(|n| valid_ids.contains(&n.id));
    }

    // 5. Text Search
    if text_query.is_empty() {
      return Ok(candidates);
    }

    // Use FTS for text search
    let conn = self.db.conn.lock().unwrap();

    // Construct FTS query: treat spaces as AND
    let fts_query = text_query
      .split_whitespace()
      .map(|s| format!("\"{}\"", s.replace("\"", ""))) // Simple quote escaping
      .collect::<Vec<_>>()
      .join(" AND ");

    // If query became empty after processing (e.g. only quotes), return empty
    if fts_query.is_empty() {
      return Ok(Vec::new());
    }

    let mut stmt = conn
      .prepare("SELECT id FROM notes_fts WHERE notes_fts MATCH ? ORDER BY rank")
      .map_err(|e| e.to_string())?;

    let fts_ids: std::collections::HashSet<i64> = stmt
      .query_map(params![fts_query], |row| row.get(0))
      .map_err(|e| e.to_string())?
      .filter_map(Result::ok)
      .collect();

    // Filter candidates by FTS results
    candidates.retain(|n| fts_ids.contains(&n.id));

    Ok(candidates)
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
          "SELECT n.id, n.title, n.created_at, n.updated_at, n.parent_id, n.file_path, n.is_deleted, n.deleted_at,
          EXISTS(SELECT 1 FROM note_tags nt JOIN tags t ON nt.tag_id = t.id WHERE nt.note_id = n.id AND t.name = 'お気に入り') as is_favorite
          FROM notes n WHERE n.id = ?",
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
              favorite_order: None,
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

      // Update FTS index
      conn
        .execute(
          "UPDATE notes_fts SET title = ?, content = ? WHERE id = ?",
          params![title, content, id],
        )
        .map_err(|e| format!("検索インデックスの更新に失敗しました: {}", e))?;

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

  // ノートの削除 (論理削除 + trashフォルダに移動)
  pub fn delete_note(&self, id: i64) -> Result<(), String> {
    // ノート情報を取得
    let file_path: String = {
      let conn = self.db.conn.lock().unwrap();
      conn
        .query_row(
          "SELECT file_path FROM notes WHERE id = ?",
          params![id],
          |row| row.get(0),
        )
        .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?
    };

    let note_path = PathBuf::from(&file_path);

    // ファイルが存在する場合、trashフォルダに移動
    if note_path.exists() {
      // trashフォルダのパスを作成
      let trash_base = self.base_path.join(".trash");

      // 相対パスを取得
      let relative_path = note_path
        .strip_prefix(&self.base_path)
        .unwrap_or(&note_path);

      let trash_path = trash_base.join(relative_path);

      // trash内の親ディレクトリを作成
      if let Some(parent) = trash_path.parent() {
        fs::create_dir_all(parent)
          .map_err(|e| format!("trashディレクトリの作成に失敗しました: {}", e))?;
      }

      // ファイルを移動
      fs::rename(&note_path, &trash_path)
        .map_err(|e| format!("ファイルのtrashへの移動に失敗しました: {}", e))?;
    }

    // データベースで論理削除
    let conn = self.db.conn.lock().unwrap();
    conn
      .execute(
        "UPDATE notes SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id = ?",
        params![id],
      )
      .map_err(|e| format!("ノートの削除に失敗しました: {}", e))?;

    // FTSから削除
    conn
      .execute("DELETE FROM notes_fts WHERE id = ?", params![id])
      .ok();

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

    // trashフォルダからファイルを削除
    let note_path = PathBuf::from(&file_path);
    let trash_base = self.base_path.join(".trash");

    let relative_path = note_path
      .strip_prefix(&self.base_path)
      .unwrap_or(&note_path);

    let trash_path = trash_base.join(relative_path);

    if trash_path.exists() {
      fs::remove_file(&trash_path)
        .map_err(|e| format!("ノートファイルの削除に失敗しました: {}", e))?;
    }

    conn
      .execute("DELETE FROM notes WHERE id = ?", params![id])
      .map_err(|e| format!("ノートの削除に失敗しました: {}", e))?;

    // FTSから削除
    conn
      .execute("DELETE FROM notes_fts WHERE id = ?", params![id])
      .ok();

    Ok(())
  }

  // ノートの復元
  pub fn restore_note(&self, id: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();

    // ノート情報を取得
    let (parent_id, file_path): (Option<i64>, String) = conn
      .query_row(
        "SELECT parent_id, file_path FROM notes WHERE id = ?",
        params![id],
        |row| Ok((row.get(0)?, row.get(1)?)),
      )
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?;

    // 親フォルダが存在し、削除されていないか確認
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

    // データベースで復元
    conn
      .execute(
        "UPDATE notes SET is_deleted = FALSE, deleted_at = NULL, parent_id = ? WHERE id = ?",
        params![new_parent_id, id],
      )
      .map_err(|e| format!("ノートの復元に失敗しました: {}", e))?;

    drop(conn);

    // ファイルをtrashから元の場所に戻す
    let note_path = PathBuf::from(&file_path);
    let trash_base = self.base_path.join(".trash");

    let relative_path = note_path
      .strip_prefix(&self.base_path)
      .unwrap_or(&note_path);

    let trash_path = trash_base.join(relative_path);

    if trash_path.exists() {
      // 元の場所の親ディレクトリを作成
      if let Some(parent) = note_path.parent() {
        fs::create_dir_all(parent)
          .map_err(|e| format!("ディレクトリの作成に失敗しました: {}", e))?;
      }

      // ファイルを戻す
      fs::rename(&trash_path, &note_path)
        .map_err(|e| format!("ファイルの復元に失敗しました: {}", e))?;

      // FTSに再登録
      if let Ok(content) = fs::read_to_string(&note_path) {
        let conn = self.db.conn.lock().unwrap();
        // titleを取得する必要があるが、ここでは簡易的にファイル名から推測するか、
        // あるいはDBから再取得する。DBから再取得が確実。
        let title: String = conn
          .query_row("SELECT title FROM notes WHERE id = ?", params![id], |row| {
            row.get(0)
          })
          .unwrap_or_default();

        conn
          .execute(
            "INSERT INTO notes_fts (id, title, content) VALUES (?, ?, ?)",
            params![id, title, content],
          )
          .ok();
      }
    }

    Ok(())
  }

  // 削除されたノートの取得
  pub fn get_deleted_notes(&self) -> Result<Vec<Note>, String> {
    let conn = self.db.conn.lock().unwrap();

    let mut stmt = conn
      .prepare(
        "SELECT n.id, n.title, n.created_at, n.updated_at, n.parent_id, n.file_path, n.preview, n.is_deleted, n.deleted_at,
        EXISTS(SELECT 1 FROM note_tags nt JOIN tags t ON nt.tag_id = t.id WHERE nt.note_id = n.id AND t.name = 'お気に入り') as is_favorite
        FROM notes n WHERE n.is_deleted = TRUE ORDER BY n.deleted_at DESC",
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
          favorite_order: None,
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
          "SELECT n.id, n.title, n.created_at, n.updated_at, n.parent_id, n.file_path, n.preview, n.is_deleted, n.deleted_at,
          EXISTS(SELECT 1 FROM note_tags nt JOIN tags t ON nt.tag_id = t.id WHERE nt.note_id = n.id AND t.name = 'お気に入り') as is_favorite
          FROM notes n WHERE n.id = ?",
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
              favorite_order: None,
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

    // 'お気に入り'タグのIDを取得
    let tag_id: i64 = conn
      .query_row(
        "SELECT id FROM tags WHERE name = 'お気に入り'",
        [],
        |row| row.get(0),
      )
      .map_err(|e| format!("'お気に入り'タグが見つかりません: {}", e))?;

    // 現在のタグ付け状態を確認
    let exists: bool = conn
      .query_row(
        "SELECT EXISTS(SELECT 1 FROM note_tags WHERE note_id = ? AND tag_id = ?)",
        params![id, tag_id],
        |row| row.get(0),
      )
      .unwrap_or(false);

    if exists {
      // 削除
      conn
        .execute(
          "DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?",
          params![id, tag_id],
        )
        .map_err(|e| format!("お気に入りの解除に失敗しました: {}", e))?;
    } else {
      // 追加
      conn
        .execute(
          "INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)",
          params![id, tag_id],
        )
        .map_err(|e| format!("お気に入りの追加に失敗しました: {}", e))?;
    }

    // 更新されたノートを取得
    drop(conn); // ロックを解放して get_note_by_id を呼ぶ
    let note_with_content = self.get_note_by_id(id)?;

    Ok(Note {
      id: note_with_content.id,
      title: note_with_content.title,
      created_at: note_with_content.created_at,
      updated_at: note_with_content.updated_at,
      parent_id: note_with_content.parent_id,
      file_path: note_with_content.file_path,
      preview: String::new(),
      is_deleted: note_with_content.is_deleted,
      deleted_at: note_with_content.deleted_at,
      is_favorite: !exists, // Toggle result
      favorite_order: None,
    })
  }

  // 複数ノートのお気に入りトグル
  pub fn toggle_favorite_notes(&self, ids: Vec<i64>) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();

    let tag_id: i64 = conn
      .query_row(
        "SELECT id FROM tags WHERE name = 'お気に入り'",
        [],
        |row| row.get(0),
      )
      .map_err(|e| format!("'お気に入り'タグが見つかりません: {}", e))?;

    let mut stmt_check = conn
      .prepare("SELECT EXISTS(SELECT 1 FROM note_tags WHERE note_id = ? AND tag_id = ?)")
      .map_err(|e| e.to_string())?;
    let mut stmt_delete = conn
      .prepare("DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?")
      .map_err(|e| e.to_string())?;
    let mut stmt_insert = conn
      .prepare("INSERT INTO note_tags (note_id, tag_id) VALUES (?, ?)")
      .map_err(|e| e.to_string())?;

    for id in ids {
      let exists: bool = stmt_check
        .query_row(params![id, tag_id], |row| row.get(0))
        .unwrap_or(false);

      if exists {
        stmt_delete
          .execute(params![id, tag_id])
          .map_err(|e| e.to_string())?;
      } else {
        stmt_insert
          .execute(params![id, tag_id])
          .map_err(|e| e.to_string())?;
      }
    }

    Ok(())
  }

  // お気に入りノート一覧を取得
  pub fn get_favorite_notes(&self) -> Result<Vec<Note>, String> {
    let conn = self.db.conn.lock().unwrap();

    let mut stmt = conn
      .prepare(
        "SELECT n.id, n.title, n.created_at, n.updated_at, n.parent_id, n.file_path, n.preview, n.is_deleted, n.deleted_at,
        TRUE as is_favorite
        FROM notes n
        JOIN note_tags nt ON n.id = nt.note_id
        JOIN tags t ON nt.tag_id = t.id
        WHERE t.name = 'お気に入り' AND n.is_deleted = FALSE
        ORDER BY nt.created_at ASC",
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
          favorite_order: None,
        })
      })
      .map_err(|e| format!("お気に入りノートの取得に失敗しました: {}", e))?
      .collect::<SqlResult<Vec<Note>>>()
      .map_err(|e| format!("お気に入りノートの取得に失敗しました: {}", e))?;

    Ok(notes)
  }

  // ノートのインポート
  pub fn import_note(
    &self,
    file_path: String,
    parent_id: Option<i64>,
  ) -> Result<NoteWithContent, String> {
    // ファイルの存在確認
    let source_path = PathBuf::from(&file_path);
    if !source_path.exists() {
      return Err("ファイルが存在しません".to_string());
    }

    // ファイル名からタイトルを取得
    let title = source_path
      .file_stem()
      .and_then(|s| s.to_str())
      .ok_or_else(|| "ファイル名の取得に失敗しました".to_string())?
      .to_string();

    // ファイルの内容を読み込む
    let content = fs::read_to_string(&source_path)
      .map_err(|e| format!("ファイルの読み込みに失敗しました: {}", e))?;

    // フォルダパスを取得
    let folder_path = if let Some(parent_id) = parent_id {
      let conn = self.db.conn.lock().unwrap();
      let path: String = conn
        .query_row(
          "SELECT folder_path FROM folders WHERE id = ?",
          params![parent_id],
          |row| row.get(0),
        )
        .map_err(|e| format!("親フォルダの取得に失敗しました: {}", e))?;
      Some(path)
    } else {
      None
    };

    // create_noteを使用してノートを作成
    self.create_note(title, content, parent_id, folder_path)
  }

  // 複数ノートのインポート
  pub fn import_notes(
    &self,
    file_paths: Vec<String>,
    parent_id: Option<i64>,
  ) -> Result<Vec<NoteWithContent>, String> {
    let mut imported_notes = Vec::new();
    let mut errors = Vec::new();

    for file_path in file_paths {
      match self.import_note(file_path.clone(), parent_id) {
        Ok(note) => imported_notes.push(note),
        Err(e) => errors.push(format!("{}: {}", file_path, e)),
      }
    }

    if !errors.is_empty() {
      return Err(format!(
        "一部のファイルのインポートに失敗しました:\n{}",
        errors.join("\n")
      ));
    }

    Ok(imported_notes)
  }

  // お気に入りの並び順を更新
  pub fn update_favorite_order(&self, _id: i64, _order: i64) -> Result<(), String> {
    // タグベースの実装では順序はサポートしない
    Ok(())
  }
}
