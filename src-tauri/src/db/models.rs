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
pub struct CreateNoteInput<'a> {
  pub title: String,
  pub content: String,
  pub folder_path: Option<&'a str>,
  pub parent_id: Option<i64>,
}

#[derive(Debug, Deserialize)]
pub struct UpdateNoteInput<'a> {
  pub title: Option<&'a str>,
  pub content: Option<&'a str>,
}
