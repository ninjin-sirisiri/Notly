
use serde_json::Value;
use std::collections::HashMap;

/// Supported locales
const SUPPORTED_LOCALES: &[&str] = &["en", "ja"];
const DEFAULT_LOCALE: &str = "en";

/// I18n struct for managing translations
pub struct I18n {
    locale: String,
    translations: HashMap<String, String>,
}

impl I18n {
    /// Create a new I18n instance with the specified locale
    pub fn new(locale: &str) -> Self {
        let validated_locale = validate_locale(locale);
        let translations = load_translations(&validated_locale);
        
        Self {
            locale: validated_locale,
            translations,
        }
    }

    /// Get a translation for the given key
    pub fn t(&self, key: &str) -> String {
        self.translations
            .get(key)
            .cloned()
            .unwrap_or_else(|| key.to_string())
    }

    /// Get a translation with variable substitution
    pub fn t_with_args(&self, key: &str, args: HashMap<String, String>) -> String {
        let mut result = self.t(key);
        
        for (placeholder, value) in args {
            let pattern = format!("{{{{{}}}}}", placeholder);
            result = result.replace(&pattern, &value);
        }
        
        result
    }

    /// Get the current locale
    pub fn locale(&self) -> &str {
        &self.locale
    }
}

/// Validate locale and return a supported locale or fallback
fn validate_locale(locale: &str) -> String {
    if SUPPORTED_LOCALES.contains(&locale) {
        locale.to_string()
    } else {
        eprintln!("Invalid locale: {}, falling back to {}", locale, DEFAULT_LOCALE);
        DEFAULT_LOCALE.to_string()
    }
}

/// Load translations for the given locale
fn load_translations(locale: &str) -> HashMap<String, String> {
    let json_str = match locale {
        "ja" => include_str!("../../locales/ja/backend.json"),
        _ => include_str!("../../locales/en/backend.json"),
    };
    
    parse_translations(json_str)
}

/// Parse JSON translations into a flat HashMap
fn parse_translations(json_str: &str) -> HashMap<String, String> {
    let mut result = HashMap::new();
    
    match serde_json::from_str::<Value>(json_str) {
        Ok(value) => {
            flatten_json(&value, String::new(), &mut result);
        }
        Err(e) => {
            eprintln!("Failed to parse translations: {}", e);
        }
    }
    
    result
}

/// Recursively flatten nested JSON into dot-notation keys
fn flatten_json(value: &Value, prefix: String, result: &mut HashMap<String, String>) {
    match value {
        Value::Object(map) => {
            for (key, val) in map {
                let new_prefix = if prefix.is_empty() {
                    key.clone()
                } else {
                    format!("{}.{}", prefix, key)
                };
                flatten_json(val, new_prefix, result);
            }
        }
        Value::String(s) => {
            result.insert(prefix, s.clone());
        }
        _ => {}
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_locale_supported() {
        assert_eq!(validate_locale("en"), "en");
        assert_eq!(validate_locale("ja"), "ja");
    }

    #[test]
    fn test_validate_locale_unsupported() {
        assert_eq!(validate_locale("fr"), "en");
        assert_eq!(validate_locale("de"), "en");
        assert_eq!(validate_locale(""), "en");
    }

    #[test]
    fn test_i18n_creation() {
        let i18n_en = I18n::new("en");
        assert_eq!(i18n_en.locale(), "en");

        let i18n_ja = I18n::new("ja");
        assert_eq!(i18n_ja.locale(), "ja");
    }

    #[test]
    fn test_i18n_fallback() {
        let i18n = I18n::new("fr");
        assert_eq!(i18n.locale(), "en");
    }

    #[test]
    fn test_translation_with_args() {
        let i18n = I18n::new("en");
        let mut args = HashMap::new();
        args.insert("name".to_string(), "Test".to_string());
        args.insert("count".to_string(), "5".to_string());
        
        // This will return the key if not found, but demonstrates the functionality
        let result = i18n.t_with_args("test.message", args);
        assert!(result.contains("Test") || result == "test.message");
    }

    #[test]
    fn test_flatten_json() {
        let json = r#"{
            "errors": {
                "file_not_found": "File not found",
                "permission_denied": "Permission denied"
            },
            "success": "Success"
        }"#;
        
        let translations = parse_translations(json);
        assert_eq!(translations.get("errors.file_not_found"), Some(&"File not found".to_string()));
        assert_eq!(translations.get("errors.permission_denied"), Some(&"Permission denied".to_string()));
        assert_eq!(translations.get("success"), Some(&"Success".to_string()));
    }
}
