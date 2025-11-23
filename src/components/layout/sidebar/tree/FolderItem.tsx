import { ChevronRight, Edit2, Folder, FolderInput, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

import { Checkbox } from '@/components/ui/checkbox';
import { useDeleteFolder, useMoveFolder, useUpdateFolder } from '@/hooks/useFolder';
import { cn } from '@/lib/utils';
import { useFolderStore } from '@/stores/folders';
import { useSelectionStore } from '@/stores/selection';
import { type FileItem as FileItemType, type FolderWithChildren } from '@/types/files';

import { FolderItemContextMenu } from './folder-item/FolderItemContextMenu';
import { FolderItemDeleteDialog } from './folder-item/FolderItemDeleteDialog';
import { FolderItemMoveMenu } from './folder-item/FolderItemMoveMenu';
import { getAllDescendants } from './folder-item/utils';

type FolderItemProps = {
  folder: FolderWithChildren;
  isActive?: boolean;
  FileItemComponent: React.ComponentType<{ item: FileItemType }>;
  onClick: () => void;
};

export function FolderItem({ folder, isActive, FileItemComponent, onClick }: FolderItemProps) {
  const { openFolderIds, toggleFolder } = useFolderStore();
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
        <FolderItemContextMenu
          onRename={() => setIsEditing(true)}
          onMove={() => setShowMoveMenu(true)}
          onDelete={() => setShowDeleteConfirm(true)}>
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
        </FolderItemContextMenu>
      )}
      {showMoveMenu && (
        <FolderItemMoveMenu
          currentFolderId={folder.id}
          onMove={handleMoveToFolder}
        />
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

      <FolderItemDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        folderName={folder.name}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
