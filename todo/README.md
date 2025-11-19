# TODO - ノート・フォルダ機能の実装

このディレクトリには、Notlyアプリのノート・フォルダ関連で実装すべき機能のタスクリストが含まれています。

## 概要

現在のコードベース分析により、以下の機能が不足していることが判明しました。各機能の詳細は個別のファイルを参照してください。

## 優先度: 高

| ファイル | 機能 | ステータス |
|---------|------|-----------|
| [01_delete_confirmation.md](./01_delete_confirmation.md) | 削除確認ダイアログ | 未着手 |
| [02_move_menu_ui.md](./02_move_menu_ui.md) | Move機能のUI露出 | 未着手 |
| [03_context_menu.md](./03_context_menu.md) | コンテキストメニュー | 未着手 |

## 優先度: 中

| ファイル | 機能 | ステータス |
|---------|------|-----------|
| [04_sort_feature.md](./04_sort_feature.md) | ソート機能 | 未着手 |
| [05_note_preview.md](./05_note_preview.md) | ノートのプレビュー | 未着手 |
| [06_bulk_operations.md](./06_bulk_operations.md) | 一括操作 | 未着手 |

## 既に実装済みの機能

- ✅ ノート・フォルダのCRUD操作
- ✅ ドラッグ&ドロップによる移動
- ✅ インライン名前変更
- ✅ 検索機能
- ✅ フォルダの展開/折りたたみ
- ✅ ダークモード
- ✅ WYSIWYGエディタモード

## 実装の進め方

1. **優先度: 高** の機能から順に実装することを推奨
2. 各機能の詳細ファイルを確認し、チェックリストに従って実装
3. 実装完了後、各ファイルの「ステータス」を更新
4. 必要に応じてこのREADMEも更新

## 関連ファイル

### 主要なストア
- `src/stores/notes.ts` - ノート管理
- `src/stores/folders.ts` - フォルダ管理
- `src/stores/files.ts` - ファイル一覧とフィルタリング

### 主要なコンポーネント
- `src/components/layout/sidebar/NoteItem.tsx` - ノートアイテム
- `src/components/layout/sidebar/FolderItem.tsx` - フォルダアイテム
- `src/components/layout/sidebar/index.tsx` - サイドバー本体

## Phase 3で計画済み（より大きな機能）

- タグ機能
- テンプレート機能
- 画像サポート

これらの機能については、優先度中の機能が完了してから検討します。
