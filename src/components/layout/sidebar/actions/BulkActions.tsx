import { FolderInput, Trash2, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { useFolderStore } from '@/stores/folders';
import { type FolderWithChildren } from '@/types/files';

type BulkActionsProps = {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => void;
  onMove: (targetFolderId: number | null) => void;
};

export function BulkActions({
  selectedCount,
  onClearSelection,
  onDelete,
  onMove
}: BulkActionsProps) {
  const [showBulkMoveMenu, setShowBulkMoveMenu] = useState(false);
  const { folders } = useFolderStore();

  function buildTree(parentId: number | null): { folder: FolderWithChildren; depth: number }[] {
    const result: { folder: FolderWithChildren; depth: number }[] = [];
    const children = folders.filter(f => f.parentId === parentId);

    for (const child of children) {
      result.push({ folder: child, depth: 0 });
      const subChildren = buildTree(child.id);
      result.push(...subChildren.map(sc => ({ ...sc, depth: sc.depth + 1 })));
    }

    return result;
  }

  const tree = buildTree(null);

  return (
    <div className="px-2 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
          {selectedCount}個選択中
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="h-6 px-2">
          <X className="h-3 w-3 mr-1" />
          解除
        </Button>
      </div>
      <div className="flex gap-2 relative">
        <Button
          variant="destructive"
          size="sm"
          onClick={onDelete}
          className="flex-1 h-8">
          <Trash2 className="h-3 w-3 mr-1" />
          削除
        </Button>
        <div className="relative flex-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowBulkMoveMenu(!showBulkMoveMenu)}
            className="w-full h-8">
            <FolderInput className="h-3 w-3 mr-1" />
            移動
          </Button>
          {showBulkMoveMenu && (
            <div className="absolute z-10 left-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg max-h-64 overflow-y-auto">
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  onMove(null);
                  setShowBulkMoveMenu(false);
                }}>
                📁 ルート
              </button>
              {tree.map(({ folder, depth }) => (
                <button
                  key={folder.id}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
                  style={{ paddingLeft: `${12 + depth * 16}px` }}
                  onClick={() => {
                    onMove(folder.id);
                    setShowBulkMoveMenu(false);
                  }}>
                  <span className="text-xs opacity-50">{'└─'.repeat(Math.min(depth, 1))}</span>📁{' '}
                  {folder.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
