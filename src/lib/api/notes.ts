import { Note, NoteWithContent } from '@/types/notes';
import { safeInvoke } from '../tauri';

export async function createNote(
  title: string,
  content: string,
  folder_path: string,
  parent_id: string | null = null
): Promise<NoteWithContent> {
  return safeInvoke<NoteWithContent>('create_note', {
    title,
    content,
    folder_path,
    parent_id
  });
}

export async function getAllNotes(): Promise<Note[]> {
  return safeInvoke<Note[]>('get_all_notes');
}

export async function getNoteById(id: string): Promise<Note | null> {
  return safeInvoke<NoteWithContent | null>('get_note_by_id', { id });
}

export async function updateNote(
  id: string,
  title: string,
  content: string
): Promise<NoteWithContent> {
  return safeInvoke<NoteWithContent>('update_note', {
    id,
    title,
    content
  });
}

export async function deleteNote(id: string): Promise<void> {
  return safeInvoke<void>('delete_note', { id });
}
