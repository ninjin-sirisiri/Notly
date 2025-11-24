use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AppConfig {
  pub data_dir: String,
}

impl AppConfig {
  pub fn load(config_path: &PathBuf) -> Option<Self> {
    if !config_path.exists() {
      return None;
    }
    let content = fs::read_to_string(config_path).ok()?;
    serde_json::from_str(&content).ok()
  }

  pub fn save(&self, config_path: &PathBuf) -> Result<(), String> {
    if let Some(parent) = config_path.parent() {
      fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let content = serde_json::to_string_pretty(self).map_err(|e| e.to_string())?;
    fs::write(config_path, content).map_err(|e| e.to_string())?;
    Ok(())
  }
}
