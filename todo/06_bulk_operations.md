# 一括操作

**優先度**: 中  
**ステータス**: 未着手

## 概要

複数のノートやフォルダを選択して、一括で削除・移動できる機能を追加する。

## 実装範囲

### 1. 選択状態の管理
- [ ] `src/stores/files.ts` または新規ストア
  - [ ] 選択されたアイテムのIDリストを管理
  - [ ] 選択モードのON/OFF切り替え

### 2. UIの拡張
- [ ] サイドバーに選択モード切り替えボタンを追加
- [ ] 選択モード時にチェックボックスを表示
- [ ] 選択されたアイテムをハイライト表示

### 3. 一括操作メニュー
- [ ] 選択されたアイテムの数を表示
- [ ] 一括削除ボタン
- [ ] 一括移動ボタン
- [ ] 選択解除ボタン

### 4. 各コンポーネントの修正
- [ ] `NoteItem.tsx`
  - [ ] チェックボックスの追加
  - [ ] 選択状態の視覚的フィードバック
- [ ] `FolderItem.tsx`
  - [ ] チェックボックスの追加
  - [ ] 選択状態の視覚的フィードバック

## 技術的な詳細

### ストアの拡張
```typescript
type SelectionStore = {
  selectionMode: boolean;
  selectedIds: number[];
  selectedType: 'note' | 'folder' | 'mixed';
  toggleSelectionMode: () => void;
  toggleSelection: (id: number, type: 'note' | 'folder') => void;
  clearSelection: () => void;
  selectAll: () => void;
};
```

### 一括削除の実装
```typescript
async function bulkDelete(ids: number[], type: 'note' | 'folder') {
  // 確認ダイアログ
  const confirmed = await showConfirmDialog(
    `${ids.length}個のアイテムを削除しますか？`
  );
  
  if (!confirmed) return;
  
  // 一括削除処理
  await Promise.all(
    ids.map(id => type === 'note' ? deleteNote(id) : deleteFolder(id))
  );
}
```

### UIイメージ
```tsx
{selectionMode && (
  <div className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20">
    <span className="text-sm">{selectedIds.length}個選択中</span>
    <button onClick={handleBulkDelete}>削除</button>
    <button onClick={handleBulkMove}>移動</button>
    <button onClick={clearSelection}>選択解除</button>
  </div>
)}
```

## 検討事項

- [ ] キーボードショートカット（Ctrl+A で全選択など）
- [ ] Shift+クリックで範囲選択
- [ ] Ctrl/Cmd+クリックで複数選択
- [ ] フォルダとノートを混在して選択可能か
- [ ] 親フォルダ選択時に子アイテムも自動選択するか
- [ ] 一括操作のUndoサポート

## 参考
- Finderの選択モード
- Google Driveの一括操作
