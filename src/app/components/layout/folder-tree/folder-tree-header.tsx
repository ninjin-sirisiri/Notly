import { FolderPlus, Notebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FolderTreeHeaderProps } from './types';

export function FolderTreeHeader({ onCreateNote, onCreateFolder }: FolderTreeHeaderProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold mb-2">Notes</h2>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onCreateNote} className="flex-1">
          <Notebook className="h-4 w-4 mr-1" />
          New Note
        </Button>
        <Button variant="outline" size="sm" onClick={onCreateFolder} className="flex-1">
          <FolderPlus className="h-4 w-4 mr-1" />
          New Folder
        </Button>
      </div>
    </div>
  );
}
