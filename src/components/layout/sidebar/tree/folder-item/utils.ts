import { type FolderWithChildren } from '@/types/files';

// フォルダとその子要素を再帰的に取得
export function getAllDescendants(
  targetFolder: FolderWithChildren
): { id: number; type: 'note' | 'folder' }[] {
  const result: { id: number; type: 'note' | 'folder' }[] = [];

  // 現在のフォルダを追加
  result.push({ id: targetFolder.id, type: 'folder' });

  // 子要素がない場合は終了
  if (!targetFolder.children || targetFolder.children.length === 0) {
    return result;
  }

  // folder.childrenから子要素を取得
  for (const child of targetFolder.children) {
    if ('folder' in child) {
      // サブフォルダの場合、再帰的に取得
      result.push(...getAllDescendants(child.folder));
    } else if ('note' in child) {
      // ノートの場合
      result.push({ id: child.note.id, type: 'note' });
    }
  }

  return result;
}
