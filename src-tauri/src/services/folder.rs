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

    fs::create_dir_all(&full_path)
      .map_err(|e| format!("ディレクトリの作成に失敗しました: {}", e))?;

    let folder_id = {
      let conn = self.db.conn.lock().unwrap();
      let folder_path_str = full_path.to_str().unwrap_or_default().to_string();

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
    let old_folder: Folder = {
      let conn = self.db.conn.lock().unwrap();
      conn.query_row(
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
		  .map_err(|e| format!("フォルダの取得に失敗しました: {}", e))?
    };

    let old_path = PathBuf::from(&old_folder.folder_path);
    let new_path = if let Some(parent) = old_path.parent() {
      parent.join(name.clone())
    } else {
      PathBuf::from(name.clone())
    };

    if old_path != new_path {
      fs::rename(&old_path, &new_path)
        .map_err(|e| format!("フォルダの移動に失敗しました: {}", e))?;
    }

    let new_path_str = new_path.to_str().unwrap_or_default().to_string();

    let updated_at = {
      let conn = self.db.conn.lock().unwrap();
      conn
        .execute(
          "UPDATE folders SET name = ?, parent_id = ?, folder_path = ? WHERE id = ?",
          params![name, parent_id, new_path_str, folder_id,],
        )
        .map_err(|e| format!("フォルダの更新に失敗しました: {}", e))?;

      conn
        .query_row(
          "SELECT updated_at FROM notes WHERE id = ?",
          params![folder_id],
          |row| row.get(0),
        )
        .map_err(|e| format!("更新日時の取得に失敗しました: {}", e))?
    };

    let new_folder = Folder {
      id: folder_id,
      name,
      created_at: old_folder.created_at,
      updated_at,
      parent_id,
      folder_path: new_path.to_string_lossy().to_string(),
    };

    let conn = self.db.conn.lock().unwrap();
    conn
      .execute(
        "UPDATE folders SET name = ?, updated_at = ?, parent_id = ?, folder_path = ? WHERE id = ?",
        params![
          new_folder.name,
          new_folder.updated_at,
          new_folder.parent_id,
          new_folder.folder_path,
          new_folder.id
        ],
      )
      .map_err(|e| format!("フォルダの更新に失敗しました: {}", e))?;

    Ok(new_folder)
  }

  // フォルダの削除
  pub fn delete_folder(&self, folder_id: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();

    let mut stmt = conn
      .prepare("DELETE FROM folders WHERE id = ?")
      .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    stmt
      .execute(params![folder_id])
      .map_err(|e| format!("フォルダの削除に失敗しました: {}", e))?;

    Ok(())
  }
}
