---
priority: P1 (高優先度)
status: 未着手
estimated_time: 1-2日
---

# キーボードショートカット

## 概要
マウス操作だけでなくキーボードショートカットを充実させることで、パワーユーザーの生産性を向上させます。

## 背景・目的
- **現状の課題**: 
  - 全ての操作がマウスベースで効率が悪い
  - キーボードだけで完結したい操作が多い
- **期待される効果**:
  - 操作速度の向上
  - キーボード中心のワークフローをサポート
  - ユーザー体験の向上

## 実装要件

### 基本ショートカット

#### ノート操作
- `Ctrl+N` / `Cmd+N` - 新しいノートを作成
- `Ctrl+S` / `Cmd+S` - 現在のノートを保存
- `Ctrl+W` / `Cmd+W` - 現在のノートを閉じる
- `Delete` - 選択中のノートを削除（ゴミ箱に移動）
- `Ctrl+D` / `Cmd+D` - ノートを複製

#### フォルダ操作
- `Ctrl+Shift+N` / `Cmd+Shift+N` - 新しいフォルダを作成
- `Delete` - 選択中のフォルダを削除

#### 検索・ナビゲーション
- `Ctrl+F` / `Cmd+F` - 検索ダイアログを開く
- `Ctrl+P` / `Cmd+P` - クイック検索（ノート名でジャンプ）
- `Ctrl+B` / `Cmd+B` - サイドバーの表示/非表示切り替え
- `↑` / `↓` - サイドバー内でノート/フォルダ間を移動
- `Enter` - 選択中のノート/フォルダを開く

#### エディタ操作
- `Ctrl+E` / `Cmd+E` - Markdown/WYSIWYGモード切り替え
- `Ctrl+B` / `Cmd+B` - テキストを太字に
- `Ctrl+I` / `Cmd+I` - テキストを斜体に
- `Ctrl+K` / `Cmd+K` - リンクの挿入
- `Ctrl+Z` / `Cmd+Z` - 元に戻す
- `Ctrl+Shift+Z` / `Cmd+Shift+Z` - やり直し

#### その他
- `Ctrl+,` / `Cmd+,` - 設定を開く
- `Escape` - ダイアログを閉じる
- `Ctrl+Q` / `Cmd+Q` - アプリを終了

### 高度なショートカット（グローバルホットキー）
- `Ctrl+Shift+N` / `Cmd+Shift+N` - アプリ外からクイックノート作成
- `Ctrl+Shift+S` / `Cmd+Shift+S` - アプリウィンドウの表示/非表示

## 技術要件

### フロントエンド
1. **イベントハンドリング**
   - ショートカットライブラリの導入（例: `react-hotkeys-hook`）
   - グローバルとローカルのキーバインド管理

2. **UI表示**
   - メニュー/ツールチップにショートカットキーを表示
   - ショートカット一覧のヘルプダイアログ（`?` キーで表示）

### バックエンド（グローバルホットキー）
- Tauriの `global-shortcut` プラグインを使用
- OS全体で動作するホットキーの登録

## 実装手順

### Phase 1: 基本ショートカット
1. `react-hotkeys-hook` のインストール
2. 各コンポーネントにショートカットを追加
   - `Sidebar.tsx`: ナビゲーション系
   - `MarkdownEditor.tsx`: エディタ系
   - `App.tsx`: グローバル系（新規作成、検索など）

### Phase 2: UI改善
1. ツールチップやメニューにショートカットキーを表示
2. ヘルプダイアログの作成（`src/components/help/ShortcutHelp.tsx`）

### Phase 3: グローバルホットキー（Phase 4対応）
1. Tauriプラグインの設定
2. `tauri.conf.json` に権限追加
3. バックエンドでグローバルホットキーを登録

## 実装例

```typescript
// src/hooks/useKeyboardShortcuts.ts
import { useHotkeys } from 'react-hotkeys-hook';

export const useKeyboardShortcuts = () => {
  // 新規ノート作成
  useHotkeys('ctrl+n, cmd+n', (e) => {
    e.preventDefault();
    createNewNote();
  });

  // 保存
  useHotkeys('ctrl+s, cmd+s', (e) => {
    e.preventDefault();
    saveCurrentNote();
  });

  // 検索
  useHotkeys('ctrl+f, cmd+f', (e) => {
    e.preventDefault();
    openSearchDialog();
  });
};
```

## 設計上の注意点
- OSごとの違い（Ctrl vs Cmd）を適切にハンドリング
- エディタ内でのショートカットとアプリレベルのショートカットの競合を防ぐ
- ショートカットをカスタマイズ可能にする（将来的な拡張）

## 参考資料
- [react-hotkeys-hook](https://github.com/JohannesKlauss/react-hotkeys-hook)
- [Tauri Global Shortcut](https://tauri.app/v1/guides/features/global-shortcut/)
- Visual Studio Codeのキーボードショートカット

## 関連タスク
- P2-advanced-search.md（検索ダイアログ）
- README.md Phase 4 - グローバルホットキー

## 備考
- 習慣化のためには操作の高速化が重要
- Phase 3 のグローバルホットキーは Phase 4 で実装予定
