import { type Note, type NoteWithContent } from '@/types/notes';

import { safeInvoke } from '../tauri';

export function createNote(
  title: string,
  content: string,
  folderPath = '',
  parentId: number | null = null
): Promise<NoteWithContent> {
  return safeInvoke<NoteWithContent>('create_note', {
    input: {
      content,
      folder_path: folderPath,
      parent_id: parentId,
      title
    }
  });
}

export function loadNotes(): Promise<Note[]> {
  return safeInvoke<Note[]>('get_all_notes');
}

export function loadNote(id: number): Promise<NoteWithContent> {
  return safeInvoke<NoteWithContent>('get_note_by_id', { id });
}

export function updateNote(id: number, title: string, content: string): Promise<NoteWithContent> {
  return safeInvoke<NoteWithContent>('update_note', {
    input: {
      content,
      id,
      title
    }
  });
}

export function deleteNote(id: number): Promise<void> {
  return safeInvoke<void>('delete_note', { id });
}

export function moveNote(id: number, newParentId: number | null): Promise<Note> {
  return safeInvoke<Note>('move_note', {
    input: {
      id,
      new_parent_id: newParentId
    }
  });
}
