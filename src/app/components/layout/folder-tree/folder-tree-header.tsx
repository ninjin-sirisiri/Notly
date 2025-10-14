import { FolderPlus, Notebook } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FolderTreeHeaderProps } from './types';
import { useNotesContext } from '@/context/notes-context';

export function FolderTreeHeader({ onCreateNote, onCreateFolder }: FolderTreeHeaderProps) {
  const { selectedFolderId } = useNotesContext();

  const handleCreateNote = () => {
    // `onCreateNote`はもともとfolderIdを受け取らない設計だったので、
    // ヘッダーから呼び出す際に選択中のIDを渡すようにする
    // ルートに作成する場合は null を渡す
    if (onCreateNote) {
      onCreateNote(selectedFolderId ?? undefined);
    }
  };

  const handleCreateFolder = () => {
    if (onCreateFolder) {
      onCreateFolder(selectedFolderId ?? undefined);
    }
  };

  return (
    <div className="p-4 border-b border-gray-200">
      <h2 className="text-lg font-semibold mb-2">Notes</h2>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={handleCreateNote} className="flex-1">
          <Notebook className="h-4 w-4 mr-1" />
          New Note
        </Button>
        <Button variant="outline" size="sm" onClick={handleCreateFolder} className="flex-1">
          <FolderPlus className="h-4 w-4 mr-1" />
          New Folder
        </Button>
      </div>
    </div>
  );
}
