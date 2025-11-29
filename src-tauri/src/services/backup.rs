use crate::db::Database;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use std::sync::Arc;
use zip::ZipWriter;
use zip::write::FileOptions;

#[derive(Debug, Serialize, Deserialize)]
pub struct BackupMetadata {
  pub version: String,
  pub created_at: String,
  pub notes_count: usize,
  pub folders_count: usize,
}

pub struct BackupService {
  db: Arc<Database>,
  base_path: PathBuf,
}

impl BackupService {
  pub fn new(db: Arc<Database>, base_path: PathBuf) -> Self {
    Self { db, base_path }
  }

  /// バックアップを作成
  pub fn create_backup(&self, backup_path: String) -> Result<String, String> {
    let backup_path = PathBuf::from(backup_path);

    // バックアップファイルのパスを生成
    let timestamp = chrono::Local::now().format("%Y%m%d_%H%M%S");
    let backup_file = backup_path.join(format!("notly_backup_{}.zip", timestamp));

    // ZIPファイルを作成
    let file =
      fs::File::create(&backup_file).map_err(|e| format!("Failed to create backup file: {}", e))?;

    let mut zip = ZipWriter::new(file);
    let options = FileOptions::<()>::default();

    // データベースファイルをバックアップ (metadata/app.db)
    let metadata_dir = self.base_path.join("metadata");
    let db_path = metadata_dir.join("app.db");
    if db_path.exists() {
      let db_content = fs::read(&db_path).map_err(|e| format!("Failed to read database: {}", e))?;
      zip
        .start_file("metadata/app.db", options)
        .map_err(|e| format!("Failed to add database to zip: {}", e))?;
      std::io::Write::write_all(&mut zip, &db_content)
        .map_err(|e| format!("Failed to write database to zip: {}", e))?;
    }

    // ノートファイルをバックアップ
    let notes_dir = self.base_path.join("notes");
    if notes_dir.exists() {
      Self::add_directory_to_zip(&mut zip, &notes_dir, "notes")?;
    }

    // メタデータを作成
    let (notes_count, folders_count) = self.get_backup_stats()?;
    let metadata = BackupMetadata {
      version: env!("CARGO_PKG_VERSION").to_string(),
      created_at: chrono::Local::now().to_rfc3339(),
      notes_count,
      folders_count,
    };

    let metadata_json = serde_json::to_string_pretty(&metadata)
      .map_err(|e| format!("Failed to serialize metadata: {}", e))?;

    zip
      .start_file("metadata.json", options)
      .map_err(|e| format!("Failed to add metadata to zip: {}", e))?;
    std::io::Write::write_all(&mut zip, metadata_json.as_bytes())
      .map_err(|e| format!("Failed to write metadata to zip: {}", e))?;

    zip
      .finish()
      .map_err(|e| format!("Failed to finish zip: {}", e))?;

    Ok(backup_file.to_string_lossy().to_string())
  }

  /// ディレクトリをZIPに追加
  fn add_directory_to_zip(
    zip: &mut ZipWriter<fs::File>,
    dir: &Path,
    prefix: &str,
  ) -> Result<(), String> {
    let options = FileOptions::<()>::default();
    let entries =
      fs::read_dir(dir).map_err(|e| format!("Failed to read directory {:?}: {}", dir, e))?;

    for entry in entries {
      let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
      let path = entry.path();
      let name = entry.file_name();
      let zip_path = format!("{}/{}", prefix, name.to_string_lossy());

      if path.is_file() {
        let content =
          fs::read(&path).map_err(|e| format!("Failed to read file {:?}: {}", path, e))?;
        zip
          .start_file(&zip_path, options)
          .map_err(|e| format!("Failed to add file to zip: {}", e))?;
        std::io::Write::write_all(zip, &content)
          .map_err(|e| format!("Failed to write file to zip: {}", e))?;
      } else if path.is_dir() {
        Self::add_directory_to_zip(zip, &path, &zip_path)?;
      }
    }

    Ok(())
  }

  /// バックアップ統計を取得
  fn get_backup_stats(&self) -> Result<(usize, usize), String> {
    let conn = self.db.conn.lock().unwrap();

    let notes_count: usize = conn
      .query_row(
        "SELECT COUNT(*) FROM notes WHERE is_deleted = FALSE",
        [],
        |row| row.get(0),
      )
      .map_err(|e| format!("Failed to count notes: {}", e))?;

    let folders_count: usize = conn
      .query_row(
        "SELECT COUNT(*) FROM folders WHERE is_deleted = FALSE",
        [],
        |row| row.get(0),
      )
      .map_err(|e| format!("Failed to count folders: {}", e))?;

    Ok((notes_count, folders_count))
  }

  /// バックアップから復元
  pub fn restore_backup(&self, backup_file: String) -> Result<(), String> {
    let backup_path = PathBuf::from(backup_file);

    if !backup_path.exists() {
      return Err("Backup file does not exist".to_string());
    }

    // 既存データのバックアップを作成
    let temp_backup_dir = self.base_path.parent().unwrap().join("temp_backup");
    fs::create_dir_all(&temp_backup_dir)
      .map_err(|e| format!("Failed to create temp backup directory: {}", e))?;

    let metadata_dir = self.base_path.join("metadata");
    let db_path = metadata_dir.join("app.db");
    let notes_dir = self.base_path.join("notes");

    // 既存のデータベースとノートをバックアップ
    if db_path.exists() {
      let temp_metadata_dir = temp_backup_dir.join("metadata");
      fs::create_dir_all(&temp_metadata_dir)
        .map_err(|e| format!("Failed to create temp metadata directory: {}", e))?;
      fs::copy(&db_path, temp_metadata_dir.join("app.db"))
        .map_err(|e| format!("Failed to backup existing database: {}", e))?;
    }
    if notes_dir.exists() {
      Self::copy_directory(&notes_dir, &temp_backup_dir.join("notes"))?;
    }

    // ZIPファイルを解凍
    let file =
      fs::File::open(&backup_path).map_err(|e| format!("Failed to open backup file: {}", e))?;

    let mut archive =
      zip::ZipArchive::new(file).map_err(|e| format!("Failed to read zip archive: {}", e))?;

    // データベースを復元
    for i in 0..archive.len() {
      let mut file = archive
        .by_index(i)
        .map_err(|e| format!("Failed to read file from archive: {}", e))?;

      // metadata.jsonは復元しない（これはバックアップ情報のみ）
      if file.name() == "metadata.json" {
        continue;
      }

      let outpath = match file.enclosed_name() {
        Some(path) => self.base_path.join(path),
        None => continue,
      };

      if file.name().ends_with('/') {
        fs::create_dir_all(&outpath).map_err(|e| format!("Failed to create directory: {}", e))?;
      } else {
        if let Some(p) = outpath.parent()
          && !p.exists()
        {
          fs::create_dir_all(p).map_err(|e| format!("Failed to create parent directory: {}", e))?;
        }
        let mut outfile =
          fs::File::create(&outpath).map_err(|e| format!("Failed to create file: {}", e))?;
        std::io::copy(&mut file, &mut outfile)
          .map_err(|e| format!("Failed to extract file: {}", e))?;
      }
    }

    // 一時バックアップを削除
    fs::remove_dir_all(&temp_backup_dir).ok();

    Ok(())
  }

  /// ディレクトリをコピー
  fn copy_directory(src: &Path, dst: &Path) -> Result<(), String> {
    fs::create_dir_all(dst).map_err(|e| format!("Failed to create directory {:?}: {}", dst, e))?;

    let entries =
      fs::read_dir(src).map_err(|e| format!("Failed to read directory {:?}: {}", src, e))?;

    for entry in entries {
      let entry = entry.map_err(|e| format!("Failed to read directory entry: {}", e))?;
      let path = entry.path();
      let dest_path = dst.join(entry.file_name());

      if path.is_file() {
        fs::copy(&path, &dest_path).map_err(|e| format!("Failed to copy file: {}", e))?;
      } else if path.is_dir() {
        Self::copy_directory(&path, &dest_path)?;
      }
    }

    Ok(())
  }

  /// バックアップファイルのメタデータを読み取る
  pub fn read_backup_metadata(&self, backup_file: String) -> Result<BackupMetadata, String> {
    let backup_path = PathBuf::from(backup_file);

    if !backup_path.exists() {
      return Err("Backup file does not exist".to_string());
    }

    let file =
      fs::File::open(&backup_path).map_err(|e| format!("Failed to open backup file: {}", e))?;

    let mut archive =
      zip::ZipArchive::new(file).map_err(|e| format!("Failed to read zip archive: {}", e))?;

    let mut metadata_file = archive
      .by_name("metadata.json")
      .map_err(|e| format!("Failed to find metadata in backup: {}", e))?;

    let mut metadata_content = String::new();
    std::io::Read::read_to_string(&mut metadata_file, &mut metadata_content)
      .map_err(|e| format!("Failed to read metadata: {}", e))?;

    let metadata: BackupMetadata = serde_json::from_str(&metadata_content)
      .map_err(|e| format!("Failed to parse metadata: {}", e))?;

    Ok(metadata)
  }

  /// 自動バックアップ設定を取得
  pub fn get_backup_settings(&self) -> Result<crate::db::models::BackupSettings, String> {
    let conn = self.db.conn.lock().unwrap();

    let settings = conn
      .query_row(
        "SELECT id, enabled, frequency, backup_path, last_backup_at, max_backups, created_at, updated_at 
         FROM backup_settings WHERE id = 1",
        [],
        |row| {
          Ok(crate::db::models::BackupSettings {
            id: row.get(0)?,
            enabled: row.get(1)?,
            frequency: row.get(2)?,
            backup_path: row.get(3)?,
            last_backup_at: row.get(4)?,
            max_backups: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
          })
        },
      )
      .map_err(|e| format!("Failed to get backup settings: {}", e))?;

    Ok(settings)
  }

  /// 自動バックアップ設定を更新
  pub fn update_backup_settings(
    &self,
    input: crate::db::models::UpdateBackupSettingsInput,
  ) -> Result<crate::db::models::BackupSettings, String> {
    let conn = self.db.conn.lock().unwrap();

    conn
      .execute(
        "UPDATE backup_settings 
         SET enabled = ?, frequency = ?, backup_path = ?, max_backups = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE id = 1",
        rusqlite::params![
          input.enabled,
          input.frequency,
          input.backup_path,
          input.max_backups,
        ],
      )
      .map_err(|e| format!("Failed to update backup settings: {}", e))?;

    drop(conn);
    self.get_backup_settings()
  }

  /// 自動バックアップを実行すべきかチェック
  pub fn should_auto_backup(&self) -> Result<bool, String> {
    let settings = self.get_backup_settings()?;

    if !settings.enabled || settings.backup_path.is_none() {
      return Ok(false);
    }

    if let Some(last_backup) = settings.last_backup_at {
      let last_backup_time = chrono::DateTime::parse_from_rfc3339(&last_backup)
        .map_err(|e| format!("Failed to parse last backup time: {}", e))?;

      let now = chrono::Local::now();
      let duration = now.signed_duration_since(last_backup_time);

      let should_backup = match settings.frequency.as_str() {
        "daily" => duration.num_hours() >= 24,
        "weekly" => duration.num_days() >= 7,
        "monthly" => duration.num_days() >= 30,
        _ => false,
      };

      Ok(should_backup)
    } else {
      // 一度もバックアップしていない場合は実行
      Ok(true)
    }
  }

  /// 自動バックアップを実行
  pub fn run_auto_backup(&self) -> Result<String, String> {
    let settings = self.get_backup_settings()?;

    if !settings.enabled {
      return Err("Auto backup is disabled".to_string());
    }

    let backup_path = settings
      .backup_path
      .ok_or("Backup path not configured".to_string())?;

    // バックアップを作成
    let backup_file = self.create_backup(backup_path.clone())?;

    // 最終バックアップ時刻を更新
    let conn = self.db.conn.lock().unwrap();
    conn
      .execute(
        "UPDATE backup_settings SET last_backup_at = ? WHERE id = 1",
        [chrono::Local::now().to_rfc3339()],
      )
      .map_err(|e| format!("Failed to update last backup time: {}", e))?;

    // 古いバックアップを削除
    self.cleanup_old_backups(&backup_path, settings.max_backups as usize)?;

    Ok(backup_file)
  }

  /// 古いバックアップファイルを削除
  fn cleanup_old_backups(&self, backup_dir: &str, max_backups: usize) -> Result<(), String> {
    let backup_path = PathBuf::from(backup_dir);

    if !backup_path.exists() {
      return Ok(());
    }

    let mut backups: Vec<(PathBuf, std::time::SystemTime)> = fs::read_dir(&backup_path)
      .map_err(|e| format!("Failed to read backup directory: {}", e))?
      .filter_map(|entry| {
        let entry = entry.ok()?;
        let path = entry.path();
        if path.is_file()
          && path.file_name()?.to_str()?.starts_with("notly_backup_")
          && path.extension()? == "zip"
        {
          let metadata = fs::metadata(&path).ok()?;
          let modified = metadata.modified().ok()?;
          Some((path, modified))
        } else {
          None
        }
      })
      .collect();

    // 新しい順にソート
    backups.sort_by(|a, b| b.1.cmp(&a.1));

    // max_backupsを超える古いバックアップを削除
    for (path, _) in backups.iter().skip(max_backups) {
      fs::remove_file(path).map_err(|e| format!("Failed to remove old backup: {}", e))?;
    }

    Ok(())
  }
}
