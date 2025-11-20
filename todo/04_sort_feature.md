# ソート機能

**優先度**: 中  
**ステータス**: 完了

## 概要

ノートとフォルダを名前順、作成日順、更新日順などでソートできる機能を追加する。

## 実装範囲

### 1. UIコンポーネントの追加
- [ ] サイドバーにソートメニューを追加
- [ ] ドロップダウンまたはボタングループでソート方式を選択

### 2. ストアの拡張
- [ ] `src/stores/files.ts`
  - [ ] ソート設定の状態を追加
  - [ ] ソート関数を実装
  - [ ] ソート方式の切り替え機能

### 3. ソートオプション
- [ ] 名前順（A-Z）
- [ ] 名前順（Z-A）
- [ ] 作成日順（新しい順）
- [ ] 作成日順（古い順）
- [ ] 更新日順（新しい順）
- [ ] 更新日順（古い順）

### 4. UI実装
- [ ] `src/components/layout/sidebar/index.tsx`
  - [ ] ソートメニューの追加
  - [ ] ソート状態の保持（localStorage等）

## 技術的な詳細

### ストアの拡張例
```typescript
// files.ts
type FileStore = {
  // ... 既存のフィールド
  sortBy: 'name' | 'created_at' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  setSortBy: (sortBy: FileStore['sortBy']) => void;
  setSortOrder: (sortOrder: FileStore['sortOrder']) => void;
};
```

### ソート関数の実装
```typescript
const sortFiles = (files: FileItem[], sortBy: string, sortOrder: string) => {
  return [...files].sort((a, b) => {
    // フォルダを常に上に表示するオプション
    const aIsFolder = 'folder' in a;
    const bIsFolder = 'folder' in b;
    
    if (aIsFolder && !bIsFolder) return -1;
    if (!aIsFolder && bIsFolder) return 1;
    
    // ソート処理
    // ...
  });
};
```

### UIイメージ
```tsx
<Select value={sortBy} onValueChange={setSortBy}>
  <SelectTrigger className="w-40">
    <SelectValue placeholder="並び替え" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="name">名前順</SelectItem>
    <SelectItem value="created_at">作成日順</SelectItem>
    <SelectItem value="updated_at">更新日順</SelectItem>
  </SelectContent>
</Select>
```

## 検討事項

- [ ] フォルダとノートを分けてソートするか、混在させるか
- [ ] デフォルトのソート方式
- [ ] ソート設定の永続化（localStorage、データベース）
- [ ] フォルダ内のアイテムも個別にソートするか
