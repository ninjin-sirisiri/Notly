# 削除確認ダイアログの実装

**優先度**: 高  
**ステータス**: 未着手

## 概要

現在、ノートやフォルダの削除ボタンをクリックすると即座に削除されてしまうため、誤操作を防ぐための確認ダイアログが必要。

## 実装範囲

### 1. UIコンポーネントの作成
- [ ] `src/components/ui/alert-dialog.tsx` を追加（shadcn/uiから）
- [ ] 削除確認用のカスタムダイアログコンポーネントを作成（オプション）

### 2. FolderItemの修正
- [ ] `src/components/layout/sidebar/FolderItem.tsx`
  - [ ] 削除確認ダイアログの状態管理を追加
  - [ ] 削除ボタンクリック時にダイアログを表示
  - [ ] ダイアログの確認後に削除実行

### 3. NoteItemの修正
- [ ] `src/components/layout/sidebar/NoteItem.tsx`
  - [ ] 削除確認ダイアログの状態管理を追加
  - [ ] 削除ボタンクリック時にダイアログを表示
  - [ ] ダイアログの確認後に削除実行

## 技術的な詳細

### AlertDialogの追加
```bash
bunx shadcn@latest add alert-dialog
```

### 実装イメージ
```tsx
const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

// 削除ボタンクリック時
onClick={() => setShowDeleteConfirm(true)}

// AlertDialog
<AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>本当に削除しますか？</AlertDialogTitle>
      <AlertDialogDescription>
        この操作は取り消せません。
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>キャンセル</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>削除</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

## 参考
- [shadcn/ui Alert Dialog](https://ui.shadcn.com/docs/components/alert-dialog)
