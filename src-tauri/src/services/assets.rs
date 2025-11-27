use crate::config::AppConfig;
use chrono::Local;
use std::fs;
use std::path::PathBuf;

pub struct AssetService;

impl AssetService {
  pub fn save_image(
    data: &[u8],
    extension: &str,
    app_config: &AppConfig,
  ) -> Result<String, String> {
    let data_dir = PathBuf::from(&app_config.data_dir);
    let assets_dir = data_dir.join("assets");

    if !assets_dir.exists() {
      fs::create_dir_all(&assets_dir)
        .map_err(|e| format!("Failed to create assets directory: {}", e))?;
    }

    let now = Local::now();
    // Use milliseconds to avoid collisions
    let filename = format!("{}.{}", now.format("%Y-%m-%d-%H%M%S%3f"), extension);
    let file_path = assets_dir.join(&filename);

    fs::write(&file_path, data).map_err(|e| format!("Failed to write image file: {}", e))?;

    // Determine MIME type
    let mime_type = match extension.to_lowercase().as_str() {
      "png" => "image/png",
      "jpg" | "jpeg" => "image/jpeg",
      "gif" => "image/gif",
      "webp" => "image/webp",
      "svg" => "image/svg+xml",
      _ => "image/png",
    };

    // Return as base64 data URL
    let base64_data = base64_encode(data);
    Ok(format!("data:{};base64,{}", mime_type, base64_data))
  }
}

fn base64_encode(data: &[u8]) -> String {
  const CHARS: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let mut result = String::new();

  let mut i = 0;
  while i < data.len() {
    let b1 = data[i];
    let b2 = if i + 1 < data.len() { data[i + 1] } else { 0 };
    let b3 = if i + 2 < data.len() { data[i + 2] } else { 0 };

    result.push(CHARS[(b1 >> 2) as usize] as char);
    result.push(CHARS[(((b1 & 0x03) << 4) | (b2 >> 4)) as usize] as char);
    result.push(if i + 1 < data.len() {
      CHARS[(((b2 & 0x0f) << 2) | (b3 >> 6)) as usize] as char
    } else {
      '='
    });
    result.push(if i + 2 < data.len() {
      CHARS[(b3 & 0x3f) as usize] as char
    } else {
      '='
    });

    i += 3;
  }

  result
}
