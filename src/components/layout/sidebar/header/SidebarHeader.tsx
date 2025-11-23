import { CheckCheck, CheckSquare } from 'lucide-react';

import { Button } from '@/components/ui/button';

import { CreateFolderButton } from '../actions/CreateFolderButton';
import { CreateNoteButton } from '../actions/CreateNoteButton';
import { FileSearch } from './FileSearch';
import { SortMenu } from './SortMenu';

type SidebarHeaderProps = {
  selectionMode: boolean;
  toggleSelectionMode: () => void;
  handleSelectAll: () => void;
  isNoteCreating: boolean;
  isCreatingNote: boolean;
  setIsCreatingNote: (value: boolean) => void;
  isFolderCreating: boolean;
  isCreatingFolder: boolean;
  setIsCreatingFolder: (value: boolean) => void;
};

export function SidebarHeader({
  selectionMode,
  toggleSelectionMode,
  handleSelectAll,
  isNoteCreating,
  isCreatingNote,
  setIsCreatingNote,
  isFolderCreating,
  isCreatingFolder,
  setIsCreatingFolder
}: SidebarHeaderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <FileSearch />
        <SortMenu />
      </div>
      <div className="px-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {!selectionMode && (
            <>
              <CreateNoteButton
                onClick={() => setIsCreatingNote(true)}
                disabled={isNoteCreating || isCreatingNote}
              />
              <CreateFolderButton
                onClick={() => setIsCreatingFolder(true)}
                disabled={isFolderCreating || isCreatingFolder}
              />
            </>
          )}
          {selectionMode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSelectAll}
              title="全選択">
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSelectionMode}
            title={selectionMode ? '選択モードを終了' : '選択モード'}>
            <CheckSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
