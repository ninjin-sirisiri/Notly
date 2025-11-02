use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
  pub id: i64,
  pub file_path: String,
  pub title: String,
  pub created_at: String,
  pub updated_at: String,
  pub parent_id: Option<i64>,
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
}

#[derive(Debug, Deserialize)]
pub struct CreateNoteInput {
  pub title: String,
  pub content: String,
  pub parent_id: Option<i64>,
  pub folder_path: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateNoteInput {
  pub id: i64,
  pub title: Option<String>,
  pub content: Option<String>,
}
