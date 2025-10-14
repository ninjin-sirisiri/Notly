import type { FolderTree } from '@/types/api';
import type { Note } from '@/types/database';

export interface FolderItemProps {
  folder: FolderTree;
  level: number;
  onCreateNote: (folderId: string) => void;
  onDeleteNote: (noteId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onCreateSubfolder: (parentId: string) => void;
  selectedNoteId?: string;
  allNotes: Note[];
}

export interface NoteItemProps {
  note: Note;
  isSelected: boolean;
  level: number;
  onDeleteNote: (noteId: string) => void;
}

export interface CreateFolderInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export interface CreateNoteInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export interface FolderTreeHeaderProps {
  onCreateNote: (folderId?: string) => void;
  onCreateFolder: (folderId?: string) => void;
}
