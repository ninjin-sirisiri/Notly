import { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Folder,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoteItem } from './note-item';
import type { FolderItemProps } from './types';
import { useNotesContext } from '@/context/notes-context';
import { cn } from '@/lib/utils';

export function FolderItem({
  folder,
  level,
  onCreateNote,
  onDeleteNote,
  onDeleteFolder,
  onCreateSubfolder,
  updateFolderName,
  selectedNoteId,
  allNotes,
}: FolderItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newFolderName, setNewFolderName] = useState(folder.name);
  const { selectedFolderId, setSelectedFolderId } = useNotesContext();

  const folderNotes = allNotes.filter((note) => note.folderId === folder.id);
  const paddingLeft = `${level * 16}px`;

  const handleFolderClick = () => {
    setSelectedFolderId(folder.id);
  };

  const handleUpdateFolderName = async () => {
    if (newFolderName.trim() && newFolderName !== folder.name) {
      await updateFolderName(folder.id, newFolderName.trim());
    }
    setIsEditing(false);
  };

  return (
    <div>
      {/* フォルダヘッダー */}
      <div
        className={cn(
          'flex items-center justify-between group hover:bg-gray-200 rounded px-2 py-1',
          selectedFolderId === folder.id && 'bg-gray-200',
        )}
        style={{ paddingLeft }}
        onClick={handleFolderClick}
      >
        <div
          className="flex items-center gap-1 flex-1 cursor-pointer"
          onClick={() => {
            if (!isEditing) {
              setIsExpanded(!isExpanded);
            }
          }}
        >
          <div className="h-6 w-6 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
          <Folder className="h-4 w-4 text-gray-600" />
          {isEditing ? (
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={handleUpdateFolderName}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleUpdateFolderName();
                }
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setNewFolderName(folder.name);
                }
              }}
              className="text-sm bg-transparent border border-gray-400 rounded px-1"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <span className="text-sm">{folder.name}</span>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            title="Rename folder"
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteFolder(folder.id);
            }}
            title="Delete folder"
          >
            <Trash2 className="h-3 w-3 text-red-500" />
          </Button>
        </div>
      </div>

      {/* 展開時の内容 */}
      {isExpanded && (
        <div>
          {/* このフォルダ内のノート */}
          {folderNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isSelected={selectedNoteId === note.id}
              level={level + 1}
              onDeleteNote={onDeleteNote}
            />
          ))}

          {/* サブフォルダ */}
          {folder.children.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              level={level + 1}
              onCreateNote={onCreateNote}
              onDeleteNote={onDeleteNote}
              onDeleteFolder={onDeleteFolder}
              onCreateSubfolder={onCreateSubfolder}
              updateFolderName={updateFolderName}
              selectedNoteId={selectedNoteId}
              allNotes={allNotes}
            />
          ))}
        </div>
      )}
    </div>
  );
}
