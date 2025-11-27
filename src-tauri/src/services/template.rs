use crate::db::Database;
use crate::db::models::{CreateTemplateInput, Template, UpdateTemplateInput};
use rusqlite::{Result as SqlResult, params};
use std::sync::Arc;

pub struct TemplateService {
  db: Arc<Database>,
}

impl TemplateService {
  pub fn new(db: Arc<Database>) -> Self {
    TemplateService { db }
  }

  /// Get all templates
  pub fn get_all_templates(&self) -> Result<Vec<Template>, String> {
    let conn = self.db.conn.lock().unwrap();
    let mut stmt = conn
      .prepare(
        "SELECT id, name, content, description, created_at, updated_at 
         FROM templates 
         ORDER BY updated_at DESC",
      )
      .map_err(|e| format!("Failed to prepare statement: {}", e))?;

    let templates = stmt
      .query_map([], |row| {
        Ok(Template {
          id: row.get(0)?,
          name: row.get(1)?,
          content: row.get(2)?,
          description: row.get(3)?,
          created_at: row.get(4)?,
          updated_at: row.get(5)?,
        })
      })
      .map_err(|e| format!("Failed to query templates: {}", e))?
      .collect::<SqlResult<Vec<Template>>>()
      .map_err(|e| format!("Failed to collect templates: {}", e))?;

    Ok(templates)
  }

  /// Get a template by ID
  pub fn get_template_by_id(&self, id: i64) -> Result<Template, String> {
    let conn = self.db.conn.lock().unwrap();
    let template = conn
      .query_row(
        "SELECT id, name, content, description, created_at, updated_at 
         FROM templates 
         WHERE id = ?",
        [id],
        |row| {
          Ok(Template {
            id: row.get(0)?,
            name: row.get(1)?,
            content: row.get(2)?,
            description: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
          })
        },
      )
      .map_err(|e| format!("Failed to fetch template: {}", e))?;

    Ok(template)
  }

  /// Create a new template
  pub fn create_template(&self, input: CreateTemplateInput) -> Result<Template, String> {
    let conn = self.db.conn.lock().unwrap();
    conn
      .execute(
        "INSERT INTO templates (name, content, description) VALUES (?, ?, ?)",
        params![input.name, input.content, input.description],
      )
      .map_err(|e| format!("Failed to create template: {}", e))?;

    let id = conn.last_insert_rowid();
    drop(conn);
    self.get_template_by_id(id)
  }

  /// Update a template
  pub fn update_template(&self, input: UpdateTemplateInput) -> Result<Template, String> {
    let conn = self.db.conn.lock().unwrap();
    conn
      .execute(
        "UPDATE templates SET name = ?, content = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        params![input.name, input.content, input.description, input.id],
      )
      .map_err(|e| format!("Failed to update template: {}", e))?;

    drop(conn);
    self.get_template_by_id(input.id)
  }

  /// Delete a template
  pub fn delete_template(&self, id: i64) -> Result<(), String> {
    let conn = self.db.conn.lock().unwrap();
    conn
      .execute("DELETE FROM templates WHERE id = ?", params![id])
      .map_err(|e| format!("Failed to delete template: {}", e))?;
    Ok(())
  }
}
