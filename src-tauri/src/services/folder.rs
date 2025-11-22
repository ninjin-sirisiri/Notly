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
          "
    INSERT INTO folders (name, folder_path, parent_id) VALUES (?, ?, ?)
    ",
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
        "
    SELECT id, name, created_at, updated_at, parent_id, folder_path FROM folders WHERE id = ?
    ",
        params![id],
        |row| {
          Ok(Folder {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
            parent_id: row.get(4)?,
            folder_path: row.get(5)?,
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
      .prepare("SELECT id, name, created_at, updated_at, parent_id, folder_path FROM folders")
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
    folder_id: i64,
    name: String,
    parent_id: Option<i64>,
  ) -> Result<Folder, String> {
    let conn = self.db.conn.lock().unwrap();

    let old_folder: Folder = conn
      .query_row(
        "SELECT id, name, created_at, updated_at, parent_id, folder_path FROM folders WHERE id = ?",
        params![folder_id],
        |row| {
          Ok(Folder {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
            parent_id: row.get(4)?,
            folder_path: row.get(5)?,
          })
        },
      )
      .map_err(|e| format!("フォルダの取得に失敗しました: {}", e))?;

    let old_path = PathBuf::from(&old_folder.folder_path);
    let new_path = if let Some(parent) = old_path.parent() {
      parent.join(&name)
    } else {
      PathBuf::from(&name)
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

    conn
      .execute(
        "UPDATE folders SET name = ?, parent_id = ? WHERE id = ?",
        params![name.clone(), parent_id, folder_id],
      )
      .map_err(|e| format!("フォルダの更新に失敗しました: {}", e))?;

    let updated_folder = conn
      .query_row(
        "SELECT id, name, created_at, updated_at, parent_id, folder_path FROM folders WHERE id = ?",
        params![folder_id],
        |row| {
          Ok(Folder {
            id: row.get(0)?,
            name: row.get(1)?,
            created_at: row.get(2)?,
            updated_at: row.get(3)?,
            parent_id: row.get(4)?,
            folder_path: row.get(5)?,
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

    // Get all folder paths for file system deletion
    let folder_paths: Vec<String> = {
      let placeholders = all_folder_ids
        .iter()
        .map(|_| "?")
        .collect::<Vec<_>>()
        .join(",");
      let query = format!(
        "SELECT folder_path FROM folders WHERE id IN ({}) ORDER BY id DESC",
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
        .query_map(params.as_slice(), |row| row.get(0))
        .map_err(|e| format!("フォルダパスの取得に失敗しました: {}", e))?
        .collect::<SqlResult<Vec<String>>>()
        .map_err(|e| format!("フォルダパスの取得に失敗しました: {}", e))?
    };

    // Delete note files
    for (_note_id, note_path) in &notes_to_delete {
      if PathBuf::from(note_path).exists() {
        fs::remove_file(note_path)
          .map_err(|e| format!("ノートファイルの削除に失敗しました: {}", e))?;
      }
    }

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

    // Delete folder directories (in reverse order to delete children first)
    for folder_path in &folder_paths {
      if PathBuf::from(folder_path).exists() {
        fs::remove_dir_all(folder_path)
          .map_err(|e| format!("フォルダディレクトリの削除に失敗しました: {}", e))?;
      }
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

    Ok(())
  }

  // フォルダの削除
  pub fn delete_folder(&self, folder_id: i64) -> Result<(), String> {
    self.delete_folder_recursive(folder_id)
  }

  // フォルダの移動
  pub fn move_folder(&self, id: i64, new_parent_id: Option<i64>) -> Result<Folder, String> {
    let old_folder: Folder = {
      let conn = self.db.conn.lock().unwrap();
      conn
        .query_row(
          "SELECT id, name, created_at, updated_at, parent_id, folder_path FROM folders WHERE id = ?",
          params![id],
          |row| {
            Ok(Folder {
              id: row.get(0)?,
              name: row.get(1)?,
              created_at: row.get(2)?,
              updated_at: row.get(3)?,
              parent_id: row.get(4)?,
              folder_path: row.get(5)?,
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

    let updated_folder = self.get_folder_by_id(id)?;

    Ok(updated_folder)
  }
}
