use std::collections::HashMap;
use std::sync::Arc;

use crate::db::Database;
use crate::db::models::{FileItem, FolderWithChildren};

pub struct FileService {
  db: Arc<Database>,
}

impl FileService {
  pub fn new(db: Arc<Database>) -> Self {
    Self { db }
  }

  pub fn get_all_files_hierarchical(&self) -> Result<Vec<FileItem>, String> {
    let conn = self.db.conn.lock().unwrap();

    let mut folder_stmt = conn
      .prepare("SELECT id, name, created_at, updated_at, parent_id, folder_path FROM folders")
      .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    let folders = folder_stmt
      .query_map([], |row| {
        Ok(FolderWithChildren {
          id: row.get(0)?,
          name: row.get(1)?,
          created_at: row.get(2)?,
          updated_at: row.get(3)?,
          parent_id: row.get(4)?,
          folder_path: row.get(5)?,
          children: Vec::new(),
        })
      })
      .map_err(|e| format!("フォルダの取得に失敗しました: {}", e))?
      .collect::<Result<Vec<FolderWithChildren>, rusqlite::Error>>()
      .map_err(|e| format!("フォルダの取得に失敗しました: {}", e))?;

    let mut note_stmt = conn
      .prepare("SELECT id, title, created_at, updated_at, parent_id, file_path, preview FROM notes ORDER BY updated_at DESC")
      .map_err(|e| format!("Failed to prepare statement: {}", e))?;
    let notes = note_stmt
      .query_map([], |row| {
        Ok(crate::db::models::Note {
          id: row.get(0)?,
          title: row.get(1)?,
          created_at: row.get(2)?,
          updated_at: row.get(3)?,
          parent_id: row.get(4)?,
          file_path: row.get(5)?,
          preview: row.get(6)?,
        })
      })
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?
      .collect::<Result<Vec<crate::db::models::Note>, rusqlite::Error>>()
      .map_err(|e| format!("ノートの取得に失敗しました: {}", e))?;

    let mut items_map: HashMap<Option<i64>, Vec<FileItem>> = HashMap::new();
    for folder in folders {
      items_map
        .entry(folder.parent_id)
        .or_default()
        .push(FileItem::Folder(folder));
    }
    for note in notes {
      items_map
        .entry(note.parent_id)
        .or_default()
        .push(FileItem::Note(note));
    }

    fn build_tree(
      items_map: &mut HashMap<Option<i64>, Vec<FileItem>>,
      parent_id: Option<i64>,
    ) -> Vec<FileItem> {
      if let Some(mut children) = items_map.remove(&parent_id) {
        for child in &mut children {
          if let FileItem::Folder(folder) = child {
            let sub_children = build_tree(items_map, Some(folder.id));
            folder.children = sub_children;
          }
        }
        return children;
      }
      Vec::new()
    }

    let result = build_tree(&mut items_map, None);
    Ok(result)
  }
}
