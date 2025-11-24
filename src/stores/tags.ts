import { create } from 'zustand';
import {
  createTag,
  updateTag,
  deleteTag,
  getAllTags,
  addTagToNote,
  removeTagFromNote,
  getTagsByNote
} from '@/lib/api/tags';
import { type Tag } from '@/types/tags';

type TagStore = {
  tags: Tag[];
  isLoading: boolean;
  error: string | null;

  loadTags: () => Promise<void>;
  createTag: (name: string, color?: string | null) => Promise<Tag>;
  updateTag: (id: number, name: string, color?: string | null) => Promise<Tag>;
  deleteTag: (id: number) => Promise<void>;

  // Note specific tag operations
  addTagToNote: (noteId: number, tagId: number) => Promise<void>;
  removeTagFromNote: (noteId: number, tagId: number) => Promise<void>;
  getTagsByNote: (noteId: number) => Promise<Tag[]>;
};

export const useTagStore = create<TagStore>(set => ({
  tags: [],
  isLoading: false,
  error: null,

  loadTags: async () => {
    set({ isLoading: true, error: null });
    try {
      const tags = await getAllTags();
      set({ tags, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: String(error) });
    }
  },

  createTag: async (name: string, color?: string | null) => {
    set({ isLoading: true, error: null });
    try {
      const newTag = await createTag(name, color);
      set(state => ({
        tags: [...state.tags, newTag].toSorted((a, b) => a.name.localeCompare(b.name)),
        isLoading: false
      }));
      return newTag;
    } catch (error) {
      set({ isLoading: false, error: String(error) });
      throw error;
    }
  },

  updateTag: async (id: number, name: string, color?: string | null) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTag = await updateTag(id, name, color);
      set(state => ({
        tags: state.tags
          .map(tag => (tag.id === id ? updatedTag : tag))
          .toSorted((a, b) => a.name.localeCompare(b.name)),
        isLoading: false
      }));
      return updatedTag;
    } catch (error) {
      set({ isLoading: false, error: String(error) });
      throw error;
    }
  },

  deleteTag: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTag(id);
      set(state => ({
        tags: state.tags.filter(tag => tag.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false, error: String(error) });
      throw error;
    }
  },

  addTagToNote: async (noteId: number, tagId: number) => {
    await addTagToNote(noteId, tagId);
  },

  removeTagFromNote: async (noteId: number, tagId: number) => {
    await removeTagFromNote(noteId, tagId);
  },

  getTagsByNote: async (noteId: number) => await getTagsByNote(noteId)
}));
