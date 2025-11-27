use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
  pub id: i64,
  pub file_path: String,
  pub title: String,
  pub created_at: String,
  pub updated_at: String,
  pub parent_id: Option<i64>,
  pub preview: String,
  #[serde(default)]
  pub is_deleted: bool,
  pub deleted_at: Option<String>,
  #[serde(default)]
  pub is_favorite: bool,
  pub favorite_order: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NoteWithContent {
  pub id: i64,
  pub file_path: String,
  pub title: String,
  pub created_at: String,
  pub updated_at: String,
  pub parent_id: Option<i64>,
  pub content: String,
  #[serde(default)]
  pub is_deleted: bool,
  pub deleted_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateNoteInput {
  pub title: String,
  pub content: String,
  pub parent_id: Option<i64>,
  pub folder_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateNoteInput {
  pub id: i64,
  pub title: String,
  pub content: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoveNoteInput {
  pub id: i64,
  pub new_parent_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Folder {
  pub id: i64,
  pub name: String,
  pub created_at: String,
  pub updated_at: String,
  pub parent_id: Option<i64>,
  pub folder_path: String,
  #[serde(default)]
  pub is_deleted: bool,
  pub deleted_at: Option<String>,
  pub icon: Option<String>,
  pub color: Option<String>,
  pub sort_by: Option<String>,
  pub sort_order: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateFolderInput {
  pub name: String,
  pub parent_id: Option<i64>,
  pub parent_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateFolderInput {
  pub id: i64,
  pub name: String,
  pub parent_id: Option<i64>,
  pub icon: Option<String>,
  pub color: Option<String>,
  pub sort_by: Option<String>,
  pub sort_order: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MoveFolderInput {
  pub id: i64,
  pub new_parent_id: Option<i64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub enum FileItem {
  Folder(FolderWithChildren),
  Note(Note),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FolderWithChildren {
  pub id: i64,
  pub name: String,
  pub created_at: String,
  pub updated_at: String,
  pub parent_id: Option<i64>,
  pub folder_path: String,
  pub children: Vec<FileItem>,
  #[serde(default)]
  pub is_deleted: bool,
  pub deleted_at: Option<String>,
  pub icon: Option<String>,
  pub color: Option<String>,
  pub sort_by: Option<String>,
  pub sort_order: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tag {
  pub id: i64,
  pub name: String,
  pub color: Option<String>,
  pub created_at: String,
  pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTagInput {
  pub name: String,
  pub color: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateTagInput {
  pub id: i64,
  pub name: String,
  pub color: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Template {
  pub id: i64,
  pub name: String,
  pub content: String,
  pub description: Option<String>,
  pub created_at: String,
  pub updated_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreateTemplateInput {
  pub name: String,
  pub content: String,
  pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UpdateTemplateInput {
  pub id: i64,
  pub name: String,
  pub content: String,
  pub description: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Hotkey {
  pub id: i64,
  pub action: String,
  pub shortcut: String,
  pub enabled: bool,
  pub created_at: String,
  pub updated_at: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateHotkeyInput {
  pub action: String,
  pub shortcut: String,
  pub enabled: bool,
}
