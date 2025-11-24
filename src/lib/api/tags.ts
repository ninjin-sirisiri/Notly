import { type Note } from '@/types/notes';
import { type Tag } from '@/types/tags';

import { safeInvoke } from '../tauri';

export function createTag(name: string, color?: string | null): Promise<Tag> {
  return safeInvoke<Tag>('create_tag', {
    input: {
      name,
      color
    }
  });
}

export function updateTag(id: number, name: string, color?: string | null): Promise<Tag> {
  return safeInvoke<Tag>('update_tag', {
    input: {
      id,
      name,
      color
    }
  });
}

export function deleteTag(id: number): Promise<void> {
  return safeInvoke<void>('delete_tag', { id });
}

export function getAllTags(): Promise<Tag[]> {
  return safeInvoke<Tag[]>('get_all_tags');
}

export function addTagToNote(noteId: number, tagId: number): Promise<void> {
  return safeInvoke<void>('add_tag_to_note', { noteId, tagId });
}

export function removeTagFromNote(noteId: number, tagId: number): Promise<void> {
  return safeInvoke<void>('remove_tag_from_note', { noteId, tagId });
}

export function getNotesByTag(tagId: number): Promise<Note[]> {
  return safeInvoke<Note[]>('get_notes_by_tag', { tagId });
}

export function getTagsByNote(noteId: number): Promise<Tag[]> {
  return safeInvoke<Tag[]>('get_tags_by_note', { noteId });
}
