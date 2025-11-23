import { useFolderStore } from '@/stores/folders';
import { type FolderWithChildren } from '@/types/files';

type FolderItemMoveMenuProps = {
  currentFolderId: number;
  onMove: (parentId: number | null) => void;
};

export function FolderItemMoveMenu({ currentFolderId, onMove }: FolderItemMoveMenuProps) {
  const { folders } = useFolderStore();

  function buildTree(parentId: number | null): { folder: FolderWithChildren; depth: number }[] {
    const result: { folder: FolderWithChildren; depth: number }[] = [];

    const children = folders.filter(f => f.parentId === parentId && f.id !== currentFolderId);

    for (const child of children) {
      result.push({ folder: child, depth: 0 });
      const subChildren = buildTree(child.id);
      result.push(...subChildren.map(sc => ({ ...sc, depth: sc.depth + 1 })));
    }

    return result;
  }

  const tree = buildTree(null);

  return (
    <div className="absolute z-10 right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg max-h-64 overflow-y-auto">
      <button
        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={e => {
          e.stopPropagation();
          onMove(null);
        }}>
        📁 ルート
      </button>
      {tree.map(({ folder, depth }) => (
        <button
          key={folder.id}
          className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
          style={{ paddingLeft: `${12 + depth * 16}px` }}
          onClick={e => {
            e.stopPropagation();
            onMove(folder.id);
          }}>
          <span className="text-xs opacity-50">{'└─'.repeat(Math.min(depth, 1))}</span>📁{' '}
          {folder.name}
        </button>
      ))}
    </div>
  );
}
