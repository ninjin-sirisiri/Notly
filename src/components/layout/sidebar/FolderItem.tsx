import { cn } from '@/lib/utils';
import { Folder, Edit2, Trash2 } from 'lucide-react';
import React from 'react';

type FolderItemProps = {
  name: string;
  isActive?: boolean;
  children?: React.ReactNode;
};

export function FolderItem({ name, isActive, children }: FolderItemProps) {
  return (
    <div>
      <a
        className={cn(
          'flex items-center gap-2 pl-2 pr-2 py-1.5 rounded text-primary dark:text-white group relative',
          isActive
            ? 'bg-gray-200 dark:bg-gray-700'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700/50'
        )}
        href="#"
      >
        <Folder className="h-4 w-4" />
        <p className="text-sm font-medium">{name}</p>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </a>
      {children && (
        <div className="pl-4 relative">
          <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
          <div className="space-y-0.5 relative">{children}</div>
        </div>
      )}
    </div>
  );
}
