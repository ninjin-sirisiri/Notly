use std::fs;
use std::path::PathBuf;
use std::sync::Arc;

use crate::db::Database;
use crate::db::models::Folder;

use rusqlite::{Result as SqlResult, params};

pub struct FolderService {
  db: Arc<Database>,
  base_path: PathBuf,
}

impl FolderService {
  pub fn new(db: Arc<Database>, base_path: PathBuf) -> Self {
    Self { db, base_path }
  }

  // フォルダの作成
  pub fn create_folder(
    &self,
    name: String,
    parent_id: Option<i64>,
    parent_path: Option<String>,
  ) -> Result<Folder, String> {
    let full_path = self
      .base_path
      .join(parent_path.clone().unwrap_or_default())
      .join(name.clone());

    let folder_path_str = full_path.to_str().unwrap_or_default().to_string();

    // 同じパスのフォルダが既に存在するかチェック
    {
      let conn = self.db.conn.lock().unwrap();
      let exists: bool = conn
        .query_row(
          "SELECT EXISTS(SELECT 1 FROM folders WHERE folder_path = ?)",
          params![folder_path_str],
          |row| row.get(0),
        )
        .unwrap_or(false);

      if exists {
        return Err(format!(
          "同じパスのフォルダが既に存在します: {}",
          folder_path_str
        ));
      }
    }

    fs::create_dir_all(&full_path)
      .map_err(|e| format!("ディレクトリの作成に失敗しました: {}", e))?;

    let folder_id = {
      let conn = self.db.conn.lock().unwrap();

      conn
        .execute(
          "\n    INSERT INTO folders (name, folder_path, parent_id) VALUES (?, ?, ?)\n    ",
          params![name, folder_path_str, parent_id],
        )
        .map_err(|e| format!("フォルダの作成に失敗しました: {}", e))?;
      conn.last_insert_rowid()
    };

    let folder = self.get_folder_by_id(folder_id)?;

    Ok(folder)
  }

  // フォルダの取得
  pub fn get_folder_by_id(&self, id: i64) -> Result<Folder, String> {
    let conn = self.db.conn.lock().unwrap();
    let folder = conn
      .query_row(
        "\n    SELECT id, name, created_at, updated_at, parent_id, folder_path, is_deleted, deleted_at, icon, color, sort_by, sort_order FROM folders WHERE id = ?\n    ",
        params![id],
        |row| {
          Ok(Folder {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
            parent_id: row.get(4)?,
            folder_path: row.get(5)?,
            is_deleted: row.get(6)?,
            deleted_at: row.get(7)?,
            icon: row.get(8)?,
            color: row.get(9)?,
            sort_by: row.get(10)?,
            sort_order: row.get(11)?,
          })
        },
      )
      .map_err(|e| format!("フォルダの取得に失敗しました: {}", e))?;
    Ok(folder)
  }

  // 全てのフォルダを取得
  pub fn get_all_folders(&self) -> Result<Vec<Folder>, String> {
    let conn = self.db.conn.lock().unwrap();

    let mut stmt = conn
      .prepare("SELECT id, name, created_at, updated_at, parent_id, folder_path, is_deleted, deleted_at, icon, color, sort_by, sort_order FROM folders WHERE is_deleted = FALSE")
      .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let folders = stmt
      .query_map([], |row| {
        Ok(Folder {
          id: row.get(0)?,
          name: row.get(1)?,
          created_at: row.get(2)?,
          updated_at: row.get(3)?,
          parent_id: row.get(4)?,
          folder_path: row.get(5)?,
          is_deleted: row.get(6)?,
          deleted_at: row.get(7)?,
          icon: row.get(8)?,
          color: row.get(9)?,
          sort_by: row.get(10)?,
          sort_order: row.get(11)?,
        })
      })
      .map_err(|e| format!("フォルダの取得に失敗しました: {}", e))?
      .collect::<SqlResult<Vec<Folder>>>()
      .map_err(|e| format!("フォルダの取得に失敗しました: {}", e))?;

    Ok(folders)
  }

  // フォルダの更新
  pub fn update_folder(
    &self,
    input: crate::db::models::UpdateFolderInput,
  ) -> Result<Folder, String> {
    let conn = self.db.conn.lock().unwrap();

    let old_folder: Folder = conn
      .query_row(
        "SELECT id, name, created_at, updated_at, parent_id, folder_path, is_deleted, deleted_at, icon, color, sort_by, sort_order FROM folders WHERE id = ?",
        params![input.id],
        |row| {
          Ok(Folder {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
            parent_id: row.get(4)?,
            folder_path: row.get(5)?,
            is_deleted: row.get(6)?,
            deleted_at: row.get(7)?,
            icon: row.get(8)?,
            color: row.get(9)?,
            sort_by: row.get(10)?,
            sort_order: row.get(11)?,
          })
        },
      )
      .map_err(|e| format!("フォルダの取得に失敗しました: {}", e))?;

    let old_path = PathBuf::from(&old_folder.folder_path);
    let new_path = if let Some(parent) = old_path.parent() {
      parent.join(&input.name)
    } else {
      PathBuf::from(&input.name)
    };
    let new_path_str = new_path.to_str().unwrap_or_default();

    if old_path != new_path {
      fs::rename(&old_path, &new_path)
        .map_err(|e| format!("フォルダ名の変更に失敗しました: {}", e))?;
    }

    let old_path_str = old_path.to_str().unwrap_or_default();

    conn
      .execute(
        "UPDATE folders SET folder_path = REPLACE(folder_path, ?, ?) WHERE folder_path LIKE ?",
        params![old_path_str, new_path_str, format!("{}%", old_path_str)],
      )
      .map_err(|e| format!("子フォルダのパスの更新に失敗しました: {}", e))?;

    conn
      .execute(
        "UPDATE notes SET file_path = REPLACE(file_path, ?, ?) WHERE file_path LIKE ?",
        params![old_path_str, new_path_str, format!("{}%", old_path_str)],
      )
      .map_err(|e| format!("子ノートのパスの更新に失敗しました: {}", e))?;

    // icon と color も更新
    conn
      .execute(
        "UPDATE folders SET name = ?, parent_id = ?, icon = ?, color = ?, sort_by = ?, sort_order = ? WHERE id = ?",
        params![input.name.clone(), input.parent_id, input.icon, input.color, input.sort_by, input.sort_order, input.id],
      )
      .map_err(|e| format!("フォルダの更新に失敗しました: {}", e))?;

    // バックリンクの更新
    self.update_backlinks(&old_path, &new_path)?;

    let updated_folder = conn
      .query_row(
        "SELECT id, name, created_at, updated_at, parent_id, folder_path, is_deleted, deleted_at, icon, color, sort_by, sort_order FROM folders WHERE id = ?",
        params![input.id],
        |row| {
          Ok(Folder {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
            parent_id: row.get(4)?,
            folder_path: row.get(5)?,
            is_deleted: row.get(6)?,
            deleted_at: row.get(7)?,
            icon: row.get(8)?,
            color: row.get(9)?,
            sort_by: row.get(10)?,
            sort_order: row.get(11)?,
          })
        },
      )
      .map_err(|e| format!("更新されたフォルダの取得に失敗しました: {}", e))?;

    Ok(updated_folder)
  }

  fn delete_folder_recursive(&self, folder_id: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();

    // Use recursive CTE to get all descendant folders in a single query
    let all_folder_ids: Vec<i64> = {
      let mut stmt = conn
        .prepare(
          "WITH RECURSIVE folder_tree AS (
            SELECT id FROM folders WHERE id = ?
            UNION ALL
            SELECT f.id FROM folders f
            INNER JOIN folder_tree ft ON f.parent_id = ft.id
          )
          SELECT id FROM folder_tree",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

      stmt
        .query_map(params![folder_id], |row| row.get(0))
        .map_err(|e| format!("フォルダツリーの取得に失敗しました: {}", e))?
        .collect::<SqlResult<Vec<i64>>>()
        .map_err(|e| format!("フォルダツリーの取得に失敗しました: {}", e))?
    };

    // Get all notes in these folders
    let notes_to_delete: Vec<(i64, String)> = {
      let placeholders = all_folder_ids
        .iter()
        .map(|_| "?")
        .collect::<Vec<_>>()
        .join(",");
      let query = format!(
        "SELECT id, file_path FROM notes WHERE parent_id IN ({})",
        placeholders
      );

      let mut stmt = conn
        .prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

      let params: Vec<&dyn rusqlite::ToSql> = all_folder_ids
        .iter()
        .map(|id| id as &dyn rusqlite::ToSql)
        .collect();

      stmt
        .query_map(params.as_slice(), |row| Ok((row.get(0)?, row.get(1)?)))
        .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?
        .collect::<SqlResult<Vec<(i64, String)>>>()
        .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?
    };

    // Get the main folder path for moving to trash
    let main_folder_path: String = conn
      .query_row(
        "SELECT folder_path FROM folders WHERE id = ?",
        params![folder_id],
        |row| row.get(0),
      )
      .map_err(|e| format!("フォルダパスの取得に失敗しました: {}", e))?;

    // Soft delete notes using IN clause
    if !notes_to_delete.is_empty() {
      let note_ids: Vec<i64> = notes_to_delete.iter().map(|(id, _)| *id).collect();
      let placeholders = note_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
      let query = format!(
        "UPDATE notes SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id IN ({})",
        placeholders
      );

      let params: Vec<&dyn rusqlite::ToSql> = note_ids
        .iter()
        .map(|id| id as &dyn rusqlite::ToSql)
        .collect();

      conn
        .execute(&query, params.as_slice())
        .map_err(|e| format!("ノートの削除に失敗しました: {}", e))?;
    }

    // Soft delete folders using IN clause
    let placeholders = all_folder_ids
      .iter()
      .map(|_| "?")
      .collect::<Vec<_>>()
      .join(",");
    let query = format!(
      "UPDATE folders SET is_deleted = TRUE, deleted_at = CURRENT_TIMESTAMP WHERE id IN ({})",
      placeholders
    );

    let params: Vec<&dyn rusqlite::ToSql> = all_folder_ids
      .iter()
      .map(|id| id as &dyn rusqlite::ToSql)
      .collect();

    conn
      .execute(&query, params.as_slice())
      .map_err(|e| format!("フォルダの削除に失敗しました: {}", e))?;

    drop(conn);

    // フォルダをtrashに移動
    let folder_path = PathBuf::from(&main_folder_path);
    if folder_path.exists() {
      let trash_base = self.base_path.join(".trash");

      let relative_path = folder_path
        .strip_prefix(&self.base_path)
        .unwrap_or(&folder_path);

      let trash_path = trash_base.join(relative_path);

      // trash内の親ディレクトリを作成
      if let Some(parent) = trash_path.parent() {
        fs::create_dir_all(parent)
          .map_err(|e| format!("trashディレクトリの作成に失敗しました: {}", e))?;
      }

      // フォルダを移動（中身ごと）
      fs::rename(&folder_path, &trash_path)
        .map_err(|e| format!("フォルダのtrashへの移動に失敗しました: {}", e))?;
    }

    Ok(())
  }

  // フォルダの完全削除
  pub fn permanently_delete_folder(&self, folder_id: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();

    // Use recursive CTE to get all descendant folders in a single query
    let all_folder_ids: Vec<i64> = {
      let mut stmt = conn
        .prepare(
          "WITH RECURSIVE folder_tree AS (
            SELECT id FROM folders WHERE id = ?
            UNION ALL
            SELECT f.id FROM folders f
            INNER JOIN folder_tree ft ON f.parent_id = ft.id
          )
          SELECT id FROM folder_tree",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

      stmt
        .query_map(params![folder_id], |row| row.get(0))
        .map_err(|e| format!("フォルダツリーの取得に失敗しました: {}", e))?
        .collect::<SqlResult<Vec<i64>>>()
        .map_err(|e| format!("フォルダツリーの取得に失敗しました: {}", e))?
    };

    // Get all notes in these folders
    let notes_to_delete: Vec<(i64, String)> = {
      let placeholders = all_folder_ids
        .iter()
        .map(|_| "?")
        .collect::<Vec<_>>()
        .join(",");
      let query = format!(
        "SELECT id, file_path FROM notes WHERE parent_id IN ({})",
        placeholders
      );

      let mut stmt = conn
        .prepare(&query)
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

      let params: Vec<&dyn rusqlite::ToSql> = all_folder_ids
        .iter()
        .map(|id| id as &dyn rusqlite::ToSql)
        .collect();

      stmt
        .query_map(params.as_slice(), |row| Ok((row.get(0)?, row.get(1)?)))
        .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?
        .collect::<SqlResult<Vec<(i64, String)>>>()
        .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?
    };

    // Get the main folder path
    let main_folder_path: String = conn
      .query_row(
        "SELECT folder_path FROM folders WHERE id = ?",
        params![folder_id],
        |row| row.get(0),
      )
      .map_err(|e| format!("フォルダパスの取得に失敗しました: {}", e))?;

    // Delete notes from database using IN clause
    if !notes_to_delete.is_empty() {
      let note_ids: Vec<i64> = notes_to_delete.iter().map(|(id, _)| *id).collect();
      let placeholders = note_ids.iter().map(|_| "?").collect::<Vec<_>>().join(",");
      let query = format!("DELETE FROM notes WHERE id IN ({})", placeholders);

      let params: Vec<&dyn rusqlite::ToSql> = note_ids
        .iter()
        .map(|id| id as &dyn rusqlite::ToSql)
        .collect();

      conn
        .execute(&query, params.as_slice())
        .map_err(|e| format!("ノートの削除に失敗しました: {}", e))?;
    }

    // Delete folders from database using IN clause
    let placeholders = all_folder_ids
      .iter()
      .map(|_| "?")
      .collect::<Vec<_>>()
      .join(",");
    let query = format!("DELETE FROM folders WHERE id IN ({})", placeholders);

    let params: Vec<&dyn rusqlite::ToSql> = all_folder_ids
      .iter()
      .map(|id| id as &dyn rusqlite::ToSql)
      .collect();

    conn
      .execute(&query, params.as_slice())
      .map_err(|e| format!("フォルダの削除に失敗しました: {}", e))?;

    drop(conn);

    // trashフォルダからフォルダを削除
    let folder_path = PathBuf::from(&main_folder_path);
    let trash_base = self.base_path.join(".trash");

    let relative_path = folder_path
      .strip_prefix(&self.base_path)
      .unwrap_or(&folder_path);

    let trash_path = trash_base.join(relative_path);

    if trash_path.exists() {
      fs::remove_dir_all(&trash_path)
        .map_err(|e| format!("フォルダディレクトリの削除に失敗しました: {}", e))?;
    }

    Ok(())
  }

  // フォルダの復元
  pub fn restore_folder(&self, id: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();

    // フォルダ情報を取得
    let (parent_id, folder_path): (Option<i64>, String) = conn
      .query_row(
        "SELECT parent_id, folder_path FROM folders WHERE id = ?",
        params![id],
        |row| Ok((row.get(0)?, row.get(1)?)),
      )
      .map_err(|e| format!("フォルダの取得に失敗しました: {}", e))?;

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

    // 再帰的に復元
    // Use recursive CTE to get all descendant folders
    let all_folder_ids: Vec<i64> = {
      let mut stmt = conn
        .prepare(
          "WITH RECURSIVE folder_tree AS (
            SELECT id FROM folders WHERE id = ?
            UNION ALL
            SELECT f.id FROM folders f
            INNER JOIN folder_tree ft ON f.parent_id = ft.id
          )
          SELECT id FROM folder_tree",
        )
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

      stmt
        .query_map(params![id], |row| row.get(0))
        .map_err(|e| format!("フォルダツリーの取得に失敗しました: {}", e))?
        .collect::<SqlResult<Vec<i64>>>()
        .map_err(|e| format!("フォルダツリーの取得に失敗しました: {}", e))?
    };

    // Restore folders
    let placeholders = all_folder_ids
      .iter()
      .map(|_| "?")
      .collect::<Vec<_>>()
      .join(",");
    let query = format!(
      "UPDATE folders SET is_deleted = FALSE, deleted_at = NULL WHERE id IN ({})",
      placeholders
    );
    let params: Vec<&dyn rusqlite::ToSql> = all_folder_ids
      .iter()
      .map(|id| id as &dyn rusqlite::ToSql)
      .collect();
    conn
      .execute(&query, params.as_slice())
      .map_err(|e| format!("フォルダの復元に失敗しました: {}", e))?;

    // Restore notes in these folders
    let query_notes = format!(
      "UPDATE notes SET is_deleted = FALSE, deleted_at = NULL WHERE parent_id IN ({})",
      placeholders
    );
    conn
      .execute(&query_notes, params.as_slice())
      .map_err(|e| format!("ノートの復元に失敗しました: {}", e))?;

    // Update parent_id of the root restored folder
    conn
      .execute(
        "UPDATE folders SET parent_id = ? WHERE id = ?",
        params![new_parent_id, id],
      )
      .map_err(|e| format!("フォルダの親ID更新に失敗しました: {}", e))?;

    drop(conn);

    // フォルダをtrashから元の場所に戻す
    let main_folder_path = PathBuf::from(&folder_path);
    let trash_base = self.base_path.join(".trash");

    let relative_path = main_folder_path
      .strip_prefix(&self.base_path)
      .unwrap_or(&main_folder_path);

    let trash_path = trash_base.join(relative_path);

    if trash_path.exists() {
      // 元の場所の親ディレクトリを作成
      if let Some(parent) = main_folder_path.parent() {
        fs::create_dir_all(parent)
          .map_err(|e| format!("ディレクトリの作成に失敗しました: {}", e))?;
      }

      // フォルダを戻す（中身ごと）
      fs::rename(&trash_path, &main_folder_path)
        .map_err(|e| format!("フォルダの復元に失敗しました: {}", e))?;
    }

    Ok(())
  }

  // 削除されたフォルダの取得
  pub fn get_deleted_folders(&self) -> Result<Vec<Folder>, String> {
    let conn = self.db.conn.lock().unwrap();

    let mut stmt = conn
      .prepare("SELECT id, name, created_at, updated_at, parent_id, folder_path, is_deleted, deleted_at, icon, color, sort_by, sort_order FROM folders WHERE is_deleted = TRUE ORDER BY deleted_at DESC")
      .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let folders = stmt
      .query_map([], |row| {
        Ok(Folder {
          id: row.get(0)?,
          name: row.get(1)?,
          created_at: row.get(2)?,
          updated_at: row.get(3)?,
          parent_id: row.get(4)?,
          folder_path: row.get(5)?,
          is_deleted: row.get(6)?,
          deleted_at: row.get(7)?,
          icon: row.get(8)?,
          color: row.get(9)?,
          sort_by: row.get(10)?,
          sort_order: row.get(11)?,
        })
      })
      .map_err(|e| format!("フォルダの取得に失敗しました: {}", e))?
      .collect::<SqlResult<Vec<Folder>>>()
      .map_err(|e| format!("フォルダの取得に失敗しました: {}", e))?;

    Ok(folders)
  }

  // フォルダの削除
  pub fn delete_folder(&self, folder_id: i64) -> Result<(), String> {
    self.delete_folder_recursive(folder_id)
  }

  fn get_relative_path(&self, path: &std::path::Path) -> String {
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
  ) -> Result<(), String> {
    let old_rel = self.get_relative_path(old_path);
    let new_rel = self.get_relative_path(new_path);

    if old_rel == new_rel {
      return Ok(());
    }

    let old_prefix = format!("[[{}/", old_rel);
    let new_prefix = format!("[[{}/", new_rel);

    let notes = {
      let conn = self.db.conn.lock().unwrap();
      let mut stmt = conn
        .prepare("SELECT id, title, file_path FROM notes ")
        .map_err(|e| format!("Failed to prepare statement: {}", e))?;

      stmt
        .query_map([], |row| {
          Ok((
            row.get::<_, i64>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
          ))
        })
        .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?
        .collect::<SqlResult<Vec<(i64, String, String)>>>()
        .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?
    };

    for (id, title, file_path) in notes {
      let content = match fs::read_to_string(&file_path) {
        Ok(c) => c,
        Err(_) => continue,
      };

      if content.contains(&old_prefix) {
        let new_content = content.replace(&old_prefix, &new_prefix);
        fs::write(&file_path, &new_content)
          .map_err(|e| format!("バックリンクの更新に失敗しました ({}): {}", title, e))?;

        let preview = crate::services::note::NoteService::generate_preview(&new_content);
        let conn = self.db.conn.lock().unwrap();
        conn
          .execute(
            "UPDATE notes SET preview = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
            params![preview, id],
          )
          .map_err(|e| format!("プレビューの更新に失敗しました: {}", e))?;
      }
    }

    Ok(())
  }

  // フォルダの移動
  pub fn move_folder(&self, id: i64, new_parent_id: Option<i64>) -> Result<Folder, String> {
    let old_folder: Folder = {
      let conn = self.db.conn.lock().unwrap();
      conn
        .query_row(
          "SELECT id, name, created_at, updated_at, parent_id, folder_path, is_deleted, deleted_at, icon, color, sort_by, sort_order FROM folders WHERE id = ?",
          params![id],
          |row| {
            Ok(Folder {
              id: row.get(0)?,
              name: row.get(1)?,
              created_at: row.get(2)?,
              updated_at: row.get(3)?,
              parent_id: row.get(4)?,
              folder_path: row.get(5)?,
              is_deleted: row.get(6)?,
              deleted_at: row.get(7)?,
              icon: row.get(8)?,
              color: row.get(9)?,
              sort_by: row.get(10)?,
              sort_order: row.get(11)?,
            })
          },
        )
        .map_err(|e| format!("フォルダの取得に失敗しました: {}", e))?
    };

    if Some(id) == new_parent_id {
      return Err("フォルダを自分自身に移動することはできません".to_string());
    }

    if let Some(new_parent) = new_parent_id {
      let mut current_parent = Some(new_parent);
      while let Some(parent_id) = current_parent {
        if parent_id == id {
          return Err("フォルダを自分の子孫に移動することはできません".to_string());
        }
        let conn = self.db.conn.lock().unwrap();
        current_parent = conn
          .query_row(
            "SELECT parent_id FROM folders WHERE id = ?",
            params![parent_id],
            |row| row.get(0),
          )
          .ok();
      }
    }

    let new_parent_path = if let Some(parent_id) = new_parent_id {
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

    let old_path = PathBuf::from(&old_folder.folder_path);
    let folder_name = old_path
      .file_name()
      .ok_or_else(|| "フォルダ名の取得に失敗しました".to_string())?;
    let new_path = new_parent_path.join(folder_name);

    if old_path != new_path {
      if let Some(parent) = new_path.parent() {
        fs::create_dir_all(parent)
          .map_err(|e| format!("ディレクトリの作成に失敗しました: {}", e))?;
      }

      fs::rename(&old_path, &new_path)
        .map_err(|e| format!("フォルダの移動に失敗しました: {}", e))?;
    }

    let old_path_str = old_path.to_str().unwrap_or_default();
    let new_path_str = new_path.to_str().unwrap_or_default();

    {
      let conn = self.db.conn.lock().unwrap();

      conn
        .execute(
          "UPDATE folders SET folder_path = REPLACE(folder_path, ?, ?) WHERE folder_path LIKE ?",
          params![old_path_str, new_path_str, format!("{}%", old_path_str)],
        )
        .map_err(|e| format!("サブフォルダのパスの更新に失敗しました: {}", e))?;

      conn
        .execute(
          "UPDATE notes SET file_path = REPLACE(file_path, ?, ?) WHERE file_path LIKE ?",
          params![old_path_str, new_path_str, format!("{}%", old_path_str)],
        )
        .map_err(|e| format!("ノートのパスの更新に失敗しました: {}", e))?;

      conn
        .execute(
          "UPDATE folders SET parent_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          params![new_parent_id, id],
        )
        .map_err(|e| format!("フォルダの移動に失敗しました: {}", e))?;
    }

    // バックリンクの更新
    self.update_backlinks(&old_path, &new_path)?;

    let updated_folder = self.get_folder_by_id(id)?;

    Ok(updated_folder)
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
  fn test_create_folder() {
    let (db, temp_dir) = setup_test_db();
    let service = FolderService::new(db, temp_dir.path().to_path_buf());

    let result = service.create_folder("テストフォルダ".to_string(), None, None);

    assert!(result.is_ok());
    let folder = result.unwrap();
    assert_eq!(folder.name, "テストフォルダ");
    assert!(!folder.is_deleted);
  }

  #[test]
  fn test_get_folder_by_id() {
    let (db, temp_dir) = setup_test_db();
    let service = FolderService::new(db.clone(), temp_dir.path().to_path_buf());

    let created = service
      .create_folder("取得テスト".to_string(), None, None)
      .unwrap();

    let result = service.get_folder_by_id(created.id);
    assert!(result.is_ok());
    let folder = result.unwrap();
    assert_eq!(folder.id, created.id);
    assert_eq!(folder.name, "取得テスト");
  }

  #[test]
  fn test_get_all_folders() {
    let (db, temp_dir) = setup_test_db();
    let service = FolderService::new(db.clone(), temp_dir.path().to_path_buf());

    service
      .create_folder("フォルダ1".to_string(), None, None)
      .unwrap();
    service
      .create_folder("フォルダ2".to_string(), None, None)
      .unwrap();

    let folders = service.get_all_folders().unwrap();
    assert_eq!(folders.len(), 2);
  }

  #[test]
  fn test_update_folder() {
    let (db, temp_dir) = setup_test_db();
    let service = FolderService::new(db.clone(), temp_dir.path().to_path_buf());

    let created = service
      .create_folder("元の名前".to_string(), None, None)
      .unwrap();

    // フォルダ名を変更しない場合、update_backlinksが呼ばれない
    let update_input = crate::db::models::UpdateFolderInput {
      id: created.id,
      name: "元の名前".to_string(), // 同じ名前なので、パスが変わらない
      parent_id: None,
      icon: Some("📁".to_string()),
      color: Some("#FF0000".to_string()),
      sort_by: None,
      sort_order: None,
    };

    let result = service.update_folder(update_input);
    assert!(result.is_ok());
    let updated = result.unwrap();
    assert_eq!(updated.name, "元の名前");
    assert_eq!(updated.icon, Some("📁".to_string()));
    assert_eq!(updated.color, Some("#FF0000".to_string()));
  }

  #[test]
  fn test_delete_folder() {
    let (db, temp_dir) = setup_test_db();
    let service = FolderService::new(db.clone(), temp_dir.path().to_path_buf());

    let created = service
      .create_folder("削除テスト".to_string(), None, None)
      .unwrap();

    let result = service.delete_folder(created.id);
    assert!(result.is_ok());

    let folders = service.get_all_folders().unwrap();
    assert_eq!(folders.len(), 0);

    let deleted_folders = service.get_deleted_folders().unwrap();
    assert_eq!(deleted_folders.len(), 1);
  }

  #[test]
  fn test_restore_folder() {
    let (db, temp_dir) = setup_test_db();
    let service = FolderService::new(db.clone(), temp_dir.path().to_path_buf());

    let created = service
      .create_folder("復元テスト".to_string(), None, None)
      .unwrap();

    service.delete_folder(created.id).unwrap();
    assert_eq!(service.get_all_folders().unwrap().len(), 0);

    service.restore_folder(created.id).unwrap();
    assert_eq!(service.get_all_folders().unwrap().len(), 1);
  }

  #[test]
  fn test_move_folder() {
    let (db, temp_dir) = setup_test_db();
    let service = FolderService::new(db.clone(), temp_dir.path().to_path_buf());

    let parent = service
      .create_folder("親フォルダ".to_string(), None, None)
      .unwrap();
    let child = service
      .create_folder("子フォルダ".to_string(), None, None)
      .unwrap();

    let result = service.move_folder(child.id, Some(parent.id));
    assert!(result.is_ok());
    let moved = result.unwrap();
    assert_eq!(moved.parent_id, Some(parent.id));
  }
}
