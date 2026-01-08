# Requirements Document

## Introduction

Notlyアプリケーションを国際化(i18n)対応させ、日本語と英語の両言語をサポートします。ユーザーは自分の好みの言語でアプリを使用でき、言語切り替えは設定画面から簡単に行えます。すべてのUI要素、メッセージ、通知が選択された言語で表示されます。

## Glossary

- **I18n_System**: 国際化システム - アプリケーション全体の多言語対応を管理するシステム
- **Language_Selector**: 言語選択機能 - ユーザーが使用言語を選択するためのUI
- **Translation_Store**: 翻訳ストア - すべての翻訳文字列を管理するデータストア
- **Locale**: ロケール - 言語と地域の組み合わせ (例: ja-JP, en-US)
- **Translation_Key**: 翻訳キー - 翻訳文字列を識別するための一意の識別子
- **Fallback_Language**: フォールバック言語 - 翻訳が見つからない場合に使用されるデフォルト言語

## Requirements

### Requirement 1: Language Selection

**User Story:** As a user, I want to select my preferred language, so that I can use the app in a language I'm comfortable with.

#### Acceptance Criteria

1. WHEN the app starts for the first time, THE I18n_System SHALL detect the system language and set it as the default language
2. WHERE the system language is not supported, THE I18n_System SHALL set English as the fallback language
3. WHEN a user opens the settings page, THE Language_Selector SHALL display all available languages (Japanese and English)
4. WHEN a user selects a language, THE I18n_System SHALL immediately update all UI text to the selected language
5. WHEN a language is selected, THE I18n_System SHALL persist the language preference to local storage

### Requirement 2: Translation Management

**User Story:** As a developer, I want a centralized translation management system, so that all UI text can be easily translated and maintained.

#### Acceptance Criteria

1. THE Translation_Store SHALL store all translation strings in JSON format organized by locale
2. WHEN a translation key is requested, THE I18n_System SHALL return the translation for the current locale
3. IF a translation key is not found for the current locale, THEN THE I18n_System SHALL return the fallback language translation
4. IF a translation key is not found in any locale, THEN THE I18n_System SHALL return the translation key itself as a visible indicator
5. THE Translation_Store SHALL support nested translation keys for better organization

### Requirement 3: UI Component Integration

**User Story:** As a developer, I want all UI components to automatically use translated text, so that the entire app is consistently localized.

#### Acceptance Criteria

1. WHEN a component renders, THE I18n_System SHALL provide the translated text for all UI elements
2. WHEN the language changes, THE I18n_System SHALL trigger a re-render of all components with updated translations
3. THE I18n_System SHALL support dynamic text interpolation for translations with variables
4. THE I18n_System SHALL support pluralization rules for different languages
5. WHEN rendering dates and times, THE I18n_System SHALL format them according to the selected locale

### Requirement 4: Translation Coverage

**User Story:** As a user, I want all parts of the app to be translated, so that I have a consistent experience in my chosen language.

#### Acceptance Criteria

1. THE I18n_System SHALL provide translations for all navigation menu items
2. THE I18n_System SHALL provide translations for all button labels and form fields
3. THE I18n_System SHALL provide translations for all error messages and notifications
4. THE I18n_System SHALL provide translations for all dialog titles and content
5. THE I18n_System SHALL provide translations for all settings page content
6. THE I18n_System SHALL provide translations for all editor toolbar items
7. THE I18n_System SHALL provide translations for all activity and streak-related text

### Requirement 5: Backend Integration

**User Story:** As a developer, I want the Rust backend to support localized messages, so that system-level notifications and errors are also translated.

#### Acceptance Criteria

1. WHEN the backend sends a notification, THE I18n_System SHALL use the user's selected language
2. WHEN the backend returns an error message, THE I18n_System SHALL provide the error in the user's selected language
3. THE I18n_System SHALL pass the current locale from frontend to backend when needed
4. THE I18n_System SHALL support translation of file operation messages
5. THE I18n_System SHALL support translation of backup and restore messages

### Requirement 6: Performance and Loading

**User Story:** As a user, I want the app to load quickly regardless of language selection, so that performance is not impacted by internationalization.

#### Acceptance Criteria

1. WHEN the app starts, THE I18n_System SHALL load only the selected language translations
2. THE I18n_System SHALL cache loaded translations in memory for fast access
3. WHEN switching languages, THE I18n_System SHALL load new translations within 100ms
4. THE Translation_Store SHALL be structured to minimize bundle size impact
5. THE I18n_System SHALL lazy-load translations for features not immediately visible

### Requirement 7: Developer Experience

**User Story:** As a developer, I want an easy way to add new translations, so that maintaining and extending language support is straightforward.

#### Acceptance Criteria

1. THE Translation_Store SHALL use a consistent key naming convention across all locales
2. THE I18n_System SHALL provide TypeScript type safety for translation keys
3. THE I18n_System SHALL provide a helper function for accessing translations in components
4. THE I18n_System SHALL log warnings when translation keys are missing during development
5. THE Translation_Store SHALL be organized by feature/component for easy navigation
