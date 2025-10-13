import { useState } from 'react';
import { ChevronDown, ChevronRight, Folder, FolderPlus, Notebook, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NoteItem } from './note-item';
import type { FolderItemProps } from './types';

export function FolderItem({
  folder,
  level,
  onCreateNote,
  onDeleteNote,
  onDeleteFolder,
  onCreateSubfolder,
  selectedNoteId,
  allNotes,
}: FolderItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const folderNotes = allNotes.filter((note) => note.folderId === folder.id);
  const paddingLeft = `${level * 16}px`;

  return (
    <div>
      {/* フォルダヘッダー */}
      <div
        className="flex items-center justify-between group hover:bg-gray-200 rounded px-2 py-1"
        style={{ paddingLeft }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className="flex items-center gap-1 flex-1 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="h-6 w-6 flex items-center justify-center">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </div>
          <Folder className="h-4 w-4 text-gray-600" />
          <span className="text-sm">{folder.name}</span>
        </div>

        {/* アクションボタン */}
        {isHovered && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onCreateNote(folder.id);
              }}
              title="Create note in this folder"
            >
              <Notebook className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                onCreateSubfolder(folder.id);
              }}
              title="Create subfolder"
            >
              <FolderPlus className="h-3 w-3" />
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
        )}
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
              selectedNoteId={selectedNoteId}
              allNotes={allNotes}
            />
          ))}
        </div>
      )}
    </div>
  );
}
