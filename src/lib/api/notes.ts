import { safeInvoke } from '../tauri';
import { Note, NoteWithContent } from '@/types/notes';

export async function createNote(
  title: string,
  content: string,
  folderPath: string = '',
  parentId: number | null = null
): Promise<NoteWithContent> {
  return safeInvoke<NoteWithContent>('create_note', {
    input: {
      title,
      content,
      folder_path: folderPath,
      parent_id: parentId
    }
  });
}

export async function loadNotes(): Promise<Note[]> {
  return safeInvoke<Note[]>('get_all_notes');
}

export async function loadNote(id: number): Promise<NoteWithContent> {
  return safeInvoke<NoteWithContent>('get_note_by_id', { id });
}

export async function updateNote(
  id: number,
  title: string,
  content: string
): Promise<NoteWithContent> {
  return await safeInvoke<NoteWithContent>('update_note', {
    input: {
      id,
      title,
      content
    }
  });
}

export async function deleteNote(id: number): Promise<void> {
  return safeInvoke<void>('delete_note', { id });
}
