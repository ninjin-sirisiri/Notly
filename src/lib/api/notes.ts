import { type Note, type NoteWithContent } from '@/types/notes';

import { getCurrentLanguage } from '../i18n';
import { safeInvoke } from '../tauri';

export function createNote(
  title: string,
  content: string,
  folderPath = '',
  parentId: number | null = null
): Promise<NoteWithContent> {
  const locale = getCurrentLanguage();
  return safeInvoke<NoteWithContent>('create_note', {
    input: {
      content,
      folder_path: folderPath,
      parent_id: parentId,
      title
    },
    locale
  });
}

export function loadNotes(): Promise<Note[]> {
  return safeInvoke<Note[]>('get_all_notes');
}

export function loadNote(id: number): Promise<NoteWithContent> {
  return safeInvoke<NoteWithContent>('get_note_by_id', { id });
}

export function updateNote(id: number, title: string, content: string): Promise<NoteWithContent> {
  const locale = getCurrentLanguage();
  return safeInvoke<NoteWithContent>('update_note', {
    input: {
      content,
      id,
      title
    },
    locale
  });
}

export function deleteNote(id: number): Promise<void> {
  const locale = getCurrentLanguage();
  return safeInvoke<void>('delete_note', { id, locale });
}

export function moveNote(id: number, newParentId: number | null): Promise<Note> {
  return safeInvoke<Note>('move_note', {
    input: {
      id,
      new_parent_id: newParentId
    }
  });
}

export function searchNotes(query: string): Promise<Note[]> {
  return safeInvoke<Note[]>('search_notes', { query });
}

export function restoreNote(id: number): Promise<void> {
  return safeInvoke<void>('restore_note', { id });
}

export function permanentlyDeleteNote(id: number): Promise<void> {
  return safeInvoke<void>('permanently_delete_note', { id });
}

export function getDeletedNotes(): Promise<Note[]> {
  return safeInvoke<Note[]>('get_deleted_notes');
}

export function toggleFavorite(id: number): Promise<Note> {
  return safeInvoke<Note>('toggle_favorite', { id });
}

export function toggleFavoriteNotes(ids: number[]): Promise<void> {
  return safeInvoke<void>('toggle_favorite_notes', { ids });
}

export function getFavoriteNotes(): Promise<Note[]> {
  return safeInvoke<Note[]>('get_favorite_notes');
}

export function importNote(
  filePath: string,
  parentId: number | null = null
): Promise<NoteWithContent> {
  const locale = getCurrentLanguage();
  return safeInvoke<NoteWithContent>('import_note', {
    filePath: filePath,
    parentId: parentId,
    locale
  });
}

export function importNotes(
  filePaths: string[],
  parentId: number | null = null
): Promise<NoteWithContent[]> {
  const locale = getCurrentLanguage();
  return safeInvoke<NoteWithContent[]>('import_notes', {
    filePaths: filePaths,
    parentId: parentId,
    locale
  });
}

export function updateFavoriteOrder(id: number, order: number): Promise<void> {
  return safeInvoke<void>('update_favorite_order', { id, order });
}
