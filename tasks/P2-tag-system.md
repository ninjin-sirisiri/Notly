---
priority: P2 (中優先度)
status: 未着手
estimated_time: 3-4日
---

# タグ機能

## 概要
ノートにタグを付けて分類・整理できるようにします。フォルダによる階層的な整理とは別に、横断的な分類が可能になります。

## 背景・目的
- **現状の課題**: 
  - フォルダだけでは多面的な分類ができない
  - 複数のカテゴリーに属するノートの管理が困難
- **期待される効果**:
  - 柔軟なノート整理が可能
  - タグベースの検索・フィルタリング
  - ノートの発見性向上

## 実装要件

### 機能要件
1. **タグの作成・管理**
   - タグの作成（自動または手動）
   - タグ名の編集
   - タグの削除
   - タグの色設定（オプション）

2. **ノートへのタグ付け**
   - ノート編集時にタグを追加・削除
   - 複数タグの付与
   - タグの自動入力補完

3. **タグビュー**
   - サイドバーにタグ一覧を表示
   - タグをクリックで該当ノート一覧を表示
   - タグごとのノート数を表示

4. **タグベースの検索・フィルタ**
   - タグでノートを絞り込み
   - 複数タグの AND/OR 検索

### データベース設計

#### 新規テーブル: `tags`
- `id` (INTEGER, PRIMARY KEY)
- `name` (TEXT, UNIQUE, NOT NULL)
- `color` (TEXT, NULLABLE) - HEX色コード
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

#### 新規テーブル: `note_tags` (中間テーブル)
- `note_id` (INTEGER, FOREIGN KEY -> notes.id)
- `tag_id` (INTEGER, FOREIGN KEY -> tags.id)
- `created_at` (TIMESTAMP)
- PRIMARY KEY (`note_id`, `tag_id`)

### 技術要件

#### バックエンド
1. **新規コマンド**
   - `create_tag(name, color)` - タグ作成
   - `update_tag(id, name, color)` - タグ更新
   - `delete_tag(id)` - タグ削除
   - `get_all_tags()` - 全タグ取得
   - `add_tag_to_note(note_id, tag_id)` - ノートにタグ追加
   - `remove_tag_from_note(note_id, tag_id)` - ノートからタグ削除
   - `get_notes_by_tag(tag_id)` - タグから該当ノート取得

2. **既存コマンドの拡張**
   - `get_all_notes()`: タグ情報も含めて返す

#### フロントエンド
1. **新しいストア**
   - `src/stores/tags.ts` - タグの状態管理

2. **UI追加**
   - `src/components/layout/sidebar/TagList.tsx` - タグ一覧
   - `src/components/layout/sidebar/TagItem.tsx` - タグアイテム
   - `src/components/tags/TagSelector.tsx` - タグ選択UI
   - `src/components/tags/TagBadge.tsx` - タグバッジ表示
   - `src/components/tags/TagManagement.tsx` - タグ管理ダイアログ

## 実装手順

### Phase 1: データベースとバックエンド
1. マイグレーション作成（tags, note_tags テーブル）
2. タグCRUD処理の実装
3. ノートとタグの紐付け処理

### Phase 2: フロントエンド基本機能
1. タグストアの作成
2. タグ一覧UIの実装
3. タグバッジコンポーネントの作成

### Phase 3: ノートへのタグ付け
1. ノート編集画面にタグセレクターを追加
2. タグの追加・削除機能
3. オートコンプリート機能

### Phase 4: タグビュー・フィルタリング
1. タグクリックで該当ノート表示
2. 検索機能とタグフィルタの統合

## UI/UXデザイン案

### タグの表示
- ノートアイテムにタグバッジを表示（最大3つ、それ以上は「+2」等）
- タグの色を背景色として使用

### タグセレクター
- 入力フィールドで検索・新規作成
- 既存タグのドロップダウン
- 選択済みタグをチップ表示

## 参考資料
- Notion のタグ（プロパティ）機能
- Obsidian のタグ機能
- Evernote のタグ機能

## 関連タスク
- P2-advanced-search.md - タグフィルタと検索の統合

## 備考
- README.md の Phase 3 に記載あり
- タグの色設定は後回しでも可（モノクロでも十分機能する）
