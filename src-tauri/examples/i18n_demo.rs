use notly_lib::i18n::I18n;
use std::collections::HashMap;

fn main() {
  println!("=== I18n Demo ===\n");

  // Test English locale
  println!("--- English Locale ---");
  let i18n_en = I18n::new("en");
  println!("Locale: {}", i18n_en.locale());
  println!("File not found: {}", i18n_en.t("errors.file_not_found"));
  println!("Note created: {}", i18n_en.t("success.note_created"));
  println!("Backup creating: {}", i18n_en.t("backup.creating"));

  // Test with args
  let mut args = HashMap::new();
  args.insert("days".to_string(), "7".to_string());
  println!(
    "Streak milestone: {}",
    i18n_en.t_with_args("notifications.streak_milestone", args.clone())
  );

  println!();

  // Test Japanese locale
  println!("--- Japanese Locale ---");
  let i18n_ja = I18n::new("ja");
  println!("Locale: {}", i18n_ja.locale());
  println!("File not found: {}", i18n_ja.t("errors.file_not_found"));
  println!("Note created: {}", i18n_ja.t("success.note_created"));
  println!("Backup creating: {}", i18n_ja.t("backup.creating"));
  println!(
    "Streak milestone: {}",
    i18n_ja.t_with_args("notifications.streak_milestone", args)
  );

  println!();

  // Test fallback for unsupported locale
  println!("--- Fallback Test (French -> English) ---");
  let i18n_fr = I18n::new("fr");
  println!("Locale: {}", i18n_fr.locale());
  println!("File not found: {}", i18n_fr.t("errors.file_not_found"));

  println!();

  // Test missing key
  println!("--- Missing Key Test ---");
  println!("Missing key: {}", i18n_en.t("nonexistent.key"));
}
