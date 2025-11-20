import { ChevronRight, Edit2, Folder, FolderInput, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@/components/ui/context-menu';
import { useDeleteFolder, useMoveFolder, useUpdateFolder } from '@/hooks/useFolder';
import { cn } from '@/lib/utils';
import { useFolderStore } from '@/stores/folders';
import { useSelectionStore } from '@/stores/selection';
import { type FileItem as FileItemType, type FolderWithChildren } from '@/types/files';

type FolderItemProps = {
  folder: FolderWithChildren;
  isActive?: boolean;
  FileItemComponent: React.ComponentType<{ item: FileItemType }>;
  onClick: () => void;
};

// フォルダとその子要素を再帰的に取得
function getAllDescendants(
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

export function FolderItem({ folder, isActive, FileItemComponent, onClick }: FolderItemProps) {
  const { openFolderIds, toggleFolder, folders } = useFolderStore();
  const isOpen = openFolderIds.includes(folder.id);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const { updateFolder } = useUpdateFolder();
  const { deleteFolder } = useDeleteFolder();
  const { moveFolder } = useMoveFolder();

  const { selectionMode, isSelected, toggleSelectionWithChildren } = useSelectionStore();
  const selected = isSelected(folder.id, 'folder');

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: folder.id
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging
  } = useDraggable({
    id: `folder-${folder.id}`,
    disabled: isEditing || selectionMode
  });

  useEffect(() => {
    setName(folder.name);
  }, [folder.name]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    if (selectionMode) {
      // 選択モード時は選択/選択解除
      const allItems = getAllDescendants(folder);
      toggleSelectionWithChildren(allItems);
    } else {
      // 通常モード時はフォルダを開閉
      toggleFolder(folder.id);
      onClick();
    }
  }

  function handleToggleFolder(e: React.MouseEvent) {
    e.stopPropagation();
    // 選択モードでもフォルダの開閉を可能にする
    toggleFolder(folder.id);
    if (!selectionMode) {
      onClick();
    }
  }

  function handleSave() {
    if (name.trim() === '') {
      setIsEditing(false);
      setName(folder.name);
    } else {
      updateFolder(folder.id, name, folder.folderPath, folder.parentId);
      setIsEditing(false);
    }
  }

  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  }

  function confirmDelete() {
    deleteFolder(folder.id);
    setShowDeleteConfirm(false);
  }

  function handleMoveToFolder(parentId: number | null) {
    moveFolder(folder.id, parentId);
    setShowMoveMenu(false);
  }

  return (
    <div>
      {isEditing ? (
        <div className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded text-primary dark:text-white group relative">
          <ChevronRight
            className={cn(
              'h-4 w-4 transform transition-transform cursor-pointer',
              isOpen && 'rotate-90'
            )}
            onClick={handleToggleFolder}
          />
          <Folder className="h-4 w-4" />
          <input
            autoFocus
            value={name}
            onBlur={handleSave}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSave();
              }
              if (e.key === 'Escape') {
                setIsEditing(false);
                setName(folder.name);
              }
            }}
            className="w-full bg-transparent outline-none"
          />
        </div>
      ) : (
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              ref={node => {
                setDroppableRef(node);
                setDraggableRef(node);
              }}
              {...attributes}
              {...listeners}
              className={cn(
                'flex items-center gap-2 pl-2 pr-2 py-1.5 rounded text-primary dark:text-white group relative cursor-pointer',
                isActive
                  ? 'bg-gray-200 dark:bg-gray-700'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700/50',
                isOver && 'bg-blue-100 dark:bg-blue-900/30',
                isDragging && 'opacity-50',
                selected && 'bg-blue-100 dark:bg-blue-900/30'
              )}
              onClick={handleClick}>
              {selectionMode && (
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => {
                    const allItems = getAllDescendants(folder);
                    toggleSelectionWithChildren(allItems);
                  }}
                  onClick={e => e.stopPropagation()}
                  className="mr-1"
                />
              )}
              <ChevronRight
                className={cn(
                  'h-4 w-4 transform transition-transform cursor-pointer',
                  isOpen && 'rotate-90'
                )}
                onClick={handleToggleFolder}
              />
              <Folder className="h-4 w-4" />
              <p className="text-sm font-medium flex-1 truncate">{folder.name}</p>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  title="名前を変更"
                  onClick={e => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}>
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  title="移動"
                  onClick={e => {
                    e.stopPropagation();
                    setShowMoveMenu(true);
                  }}>
                  <FolderInput className="h-3.5 w-3.5" />
                </button>
                <button
                  className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  title="削除"
                  onClick={handleDelete}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={e => {
                e.stopPropagation();
                setIsEditing(true);
              }}>
              <Edit2 className="mr-2 h-4 w-4" />
              名前を変更
            </ContextMenuItem>
            <ContextMenuItem
              onClick={e => {
                e.stopPropagation();
                setShowMoveMenu(true);
              }}>
              <FolderInput className="mr-2 h-4 w-4" />
              移動
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={e => {
                e.stopPropagation();
                setShowDeleteConfirm(true);
              }}
              className="text-red-600 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}
      {showMoveMenu && (
        <div className="absolute z-10 right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg max-h-64 overflow-y-auto">
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={e => {
              e.stopPropagation();
              handleMoveToFolder(null);
            }}>
            📁 ルート
          </button>
          {(() => {
            // Build folder tree, excluding current folder and its descendants
            function buildTree(
              parentId: number | null
            ): { folder: FolderWithChildren; depth: number }[] {
              const result: { folder: FolderWithChildren; depth: number }[] = [];
              const children = folders.filter(f => f.parentId === parentId && f.id !== folder.id);

              for (const child of children) {
                result.push({ folder: child, depth: 0 });
                const subChildren = buildTree(child.id);
                result.push(...subChildren.map(sc => ({ ...sc, depth: sc.depth + 1 })));
              }

              return result;
            }

            const tree = buildTree(null);

            return tree.map(({ folder: f, depth }) => (
              <button
                key={f.id}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
                style={{ paddingLeft: `${12 + depth * 16}px` }}
                onClick={e => {
                  e.stopPropagation();
                  handleMoveToFolder(f.id);
                }}>
                <span className="text-xs opacity-50">{'└─'.repeat(Math.min(depth, 1))}</span>📁{' '}
                {f.name}
              </button>
            ));
          })()}
        </div>
      )}
      {isOpen && folder.children && folder.children.length > 0 && (
        <div className="pl-4 relative">
          <div className="space-y-0.5 relative">
            {folder.children.map(item => (
              <FileItemComponent
                key={'folder' in item ? `folder-${item.folder.id}` : `note-${item.note.id}`}
                item={item}
              />
            ))}
          </div>
        </div>
      )}

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>フォルダを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{folder.name}」を削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
