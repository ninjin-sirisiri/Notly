# バックアップ機能 (Backup Functionality)

## 概要
ユーザーのデータを保護するため、ノートデータのバックアップと復元機能を提供する。

## 要件
- 定期的な自動バックアップ
- 手動バックアップ実行
- バックアップファイル（ZIPやJSONなど）のインポート/エクスポート
- バックアップ保存先の選択

## タスク
- [x] バックアップ形式の設計(JSONエクスポート または DBファイルコピー) - ZIP形式で実装
- [x] バックアップ処理の実装(Rust/Tauri) - BackupServiceとして実装
- [x] 復元(リストア)処理の実装 - 既存データのバックアップ+復元機能実装
- [x] 設定画面へのバックアップ・復元UIの追加 - BackupSettingsコンポーネント実装
- [ ] 自動バックアップのスケジューリング機能

## 実装詳細
- **バックアップ形式**: ZIP圧縮形式
  - データベースファイル (notly.db)
  - ノートファイル (notes/)
  - メタデータ (metadata.json)
- **フロントエンド**: BackupSettings コンポーネント
- **バックエンド**: BackupService (Rust)
- **API**: create_backup, restore_backup, read_backup_metadata
