import { ChevronRight, Edit2, Folder, Trash2 } from 'lucide-react';
import React, { useState } from 'react';

import { cn } from '@/lib/utils';
import { type FolderWithChildren, type FileItem as FileItemType } from '@/types/files';

type FolderItemProps = {
  folder: FolderWithChildren;
  isActive?: boolean;
  FileItemComponent: React.ComponentType<{ item: FileItemType }>;
  onClick: () => void;
};

export function FolderItem({ folder, isActive, FileItemComponent, onClick }: FolderItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleClick() {
    setIsOpen(!isOpen);
    onClick();
  }

  return (
    <div>
      <div
        className={cn(
          'flex items-center gap-2 pl-2 pr-2 py-1.5 rounded text-primary dark:text-white group relative cursor-pointer',
          isActive ? 'bg-gray-200 dark:bg-gray-700' : 'hover:bg-gray-200 dark:hover:bg-gray-700/50'
        )}
        onClick={handleClick}>
        <ChevronRight
          className={cn('h-4 w-4 transform transition-transform', isOpen && 'rotate-90')}
        />
        <Folder className="h-4 w-4" />
        <p className="text-sm font-medium flex-1">{folder.name}</p>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
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
