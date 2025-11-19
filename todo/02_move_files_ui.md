# Move機能のUI露出

**優先度**: 高  
**ステータス**: 未着手

## 概要

`NoteItem.tsx`にMove機能のコードが既に存在するが、UIから呼び出せない状態になっている。  
ボタンやメニューを追加して、ユーザーがノートを別のフォルダに移動できるようにする。

## 現状の問題

- `showMoveMenu`の状態管理は実装済み
- Move先を選択するメニューのUIも実装済み
- しかし、`setShowMoveMenu(true)`を呼び出すボタンが存在しない

## 実装範囲

### 1. NoteItemの修正
- [x] `src/components/layout/sidebar/NoteItem.tsx`
  - [x] Moveボタンを追加（Edit、Deleteボタンと並べて配置）
  - [x] ボタンクリック時に`setShowMoveMenu(true)`を呼び出し

### 2. FolderItemへの同様の機能追加（オプション）
- [x] `src/components/layout/sidebar/FolderItem.tsx`
  - [x] フォルダもMoveメニューで移動できるようにする
  - [x] ドラッグ&ドロップと併用可能にする

## 技術的な詳細

### 実装イメージ（NoteItem）
```tsx
import { Edit2, FileText, Trash2, FolderInput } from 'lucide-react';

// ボタンエリアに追加
<button
  className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
  title="移動"
  onClick={e => {
    e.stopPropagation();
    setShowMoveMenu(true);
  }}>
  <FolderInput className="h-3.5 w-3.5" />
</button>
```

### FolderItemへの実装
- NoteItemと同様のMove機能を追加
- 既存のドラッグ&ドロップと重複しないようにする
- メニューで移動先を選択する方が直感的な場合もある

## 検討事項

- [x] アイコンの選択（FolderInput, Move, ArrowRightなど）
- [x] メニューの配置（ボタンエリアに収まるか）
- [x] クリック時にメニューが見切れないか確認
