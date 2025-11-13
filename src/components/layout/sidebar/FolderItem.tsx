import { ChevronRight, Edit2, Folder, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

import { useDeleteFolder, useUpdateFolder } from '@/hooks/useFolder';
import { cn } from '@/lib/utils';
import { useFolderStore } from '@/stores/folders';
import { type FileItem as FileItemType, type FolderWithChildren } from '@/types/files';

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
  const { updateFolder } = useUpdateFolder();
  const { deleteFolder } = useDeleteFolder();

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
    disabled: isEditing
  });

  useEffect(() => {
    setName(folder.name);
  }, [folder]);

  function handleClick() {
    toggleFolder(folder.id);
    onClick();
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
    deleteFolder(folder.id);
  }

  return (
    <div>
      {isEditing ? (
        <div className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded text-primary dark:text-white group relative">
          <ChevronRight
            className={cn('h-4 w-4 transform transition-transform', isOpen && 'rotate-90')}
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
            isDragging && 'opacity-50'
          )}
          onClick={handleClick}>
          <ChevronRight
            className={cn('h-4 w-4 transform transition-transform', isOpen && 'rotate-90')}
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
              title="削除"
              onClick={handleDelete}>
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
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
    </div>
  );
}
