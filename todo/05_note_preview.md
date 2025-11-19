# ノートのプレビュー

**優先度**: 中  
**ステータス**: 未着手

## 概要

サイドバーのノートアイテムで、ノートの内容の一部をプレビュー表示する機能を追加する。

## 実装範囲

### 1. データ構造の拡張
- [ ] ノートのプレビューテキストを取得する処理
  - [ ] 最初の数行を抽出
  - [ ] Markdownのフォーマットを除去

### 2. UIの拡張
- [ ] `src/components/layout/sidebar/NoteItem.tsx`
  - [ ] プレビューテキストを表示する領域を追加
  - [ ] スタイリング（グレーアウト、小さいフォント）
  - [ ] 長すぎるテキストは省略記号で切り詰め

### 3. プレビュー表示の切り替え
- [ ] 設定でプレビュー表示のON/OFFを切り替え可能にする（オプション）
- [ ] プレビューの長さを設定可能にする（オプション）

## 技術的な詳細

### プレビューテキストの生成
```typescript
function generatePreview(content: string, maxLength: number = 100): string {
  // Markdownの記号を削除
  const plainText = content
    .replace(/^#+\s/gm, '') // 見出し
    .replace(/\*\*(.+?)\*\*/g, '$1') // 太字
    .replace(/\*(.+?)\*/g, '$1') // イタリック
    .replace(/\[(.+?)\]\(.+?\)/g, '$1') // リンク
    .trim();
  
  // 最初の数文字を取得
  return plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + '...' 
    : plainText;
}
```

### UIイメージ
```tsx
<div className="flex flex-col gap-0.5">
  <p className="text-sm font-medium truncate">{note.title}</p>
  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
    {generatePreview(note.content)}
  </p>
</div>
```

## 検討事項

- [ ] プレビュー表示によってサイドバーの高さが変わる
- [ ] パフォーマンスへの影響（大量のノートがある場合）
- [ ] プレビューの更新タイミング（リアルタイム or 保存時）
- [ ] 画像やコードブロックの扱い

## 参考
- Notionのサイドバープレビュー
- Obsidianのファイルエクスプローラー
