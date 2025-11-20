# コンテキストメニュー（右クリックメニュー）

**優先度**: 高  
**ステータス**: 完了

## 概要

現在はホバー時のボタンのみで操作を行うが、右クリックでコンテキストメニューを表示し、「名前変更」「移動」「削除」などの操作を提供する。

## 実装範囲

### 1. コンテキストメニューコンポーネントの作成
- [x] `src/components/ui/context-menu.tsx` を追加（shadcn/uiから）
- [x] または独自のポップアップメニューコンポーネントを作成

### 2. NoteItemへの適用
- [x] `src/components/layout/sidebar/NoteItem.tsx`
  - [x] 右クリック時にコンテキストメニューを表示
  - [x] メニュー項目：
    - [x] 名前を変更
    - [x] 移動
    - [x] 削除
    - [ ] ファイルパスをコピー（オプション）

### 3. FolderItemへの適用
- [x] `src/components/layout/sidebar/FolderItem.tsx`
  - [x] 右クリック時にコンテキストメニューを表示
  - [x] メニュー項目：
    - [x] 名前を変更
    - [x] 移動
    - [x] 削除
    - [ ] 新しいノートを作成（オプション）
    - [ ] 新しいフォルダを作成（オプション）

## 技術的な詳細

### Context Menuの追加
```bash
bunx shadcn@latest add context-menu
```

### 実装イメージ
```tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

<ContextMenu>
  <ContextMenuTrigger>
    {/* 既存のノート/フォルダアイテム */}
  </ContextMenuTrigger>
  <ContextMenuContent>
    <ContextMenuItem onClick={() => setIsEditing(true)}>
      <Edit2 className="mr-2 h-4 w-4" />
      名前を変更
    </ContextMenuItem>
    <ContextMenuItem onClick={() => setShowMoveMenu(true)}>
      <FolderInput className="mr-2 h-4 w-4" />
      移動
    </ContextMenuItem>
    <ContextMenuItem onClick={handleDelete}>
      <Trash2 className="mr-2 h-4 w-4" />
      削除
    </ContextMenuItem>
  </ContextMenuContent>
</ContextMenu>
```

## 検討事項

- [ ] ホバーボタンとコンテキストメニューの両立
- [ ] モバイル対応（長押しでメニュー表示など）
- [ ] キーボードショートカットの追加（オプション）

## 参考
- [shadcn/ui Context Menu](https://ui.shadcn.com/docs/components/context-menu)
