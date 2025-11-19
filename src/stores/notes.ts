import { create } from 'zustand';

import { createNote, deleteNote, loadNote, loadNotes, moveNote, updateNote } from '@/lib/api/notes';
import { type Note, type NoteWithContent } from '@/types/notes';

import { useFileStore } from './files';
import { useFolderStore } from './folders';

type NoteStore = {
  notes: Note[];
  currentNote: Note | null;
  currentContent: string | null;
  setCurrentNote: (note: Note | null) => void;
  setCurrentContent: (content: string | null) => void;
  isLoading: boolean;
  error: string | null;

  createNote: (
    title: string,
    content: string,
    folderPath: string,
    parentId?: number | null
  ) => Promise<NoteWithContent>;
  loadNotes: () => Promise<void>;
  loadNote: (id: number) => Promise<void>;
  updateNote: (id: number, title: string, content: string) => Promise<void>;
  deleteNote: (id: number) => Promise<void>;
  moveNote: (id: number, newParentId: number | null) => Promise<void>;
};

export const useNoteStore = create<NoteStore>()((set, get) => ({
  notes: [],
  currentNote: null,
  currentContent: null,
  setCurrentContent: (content: string | null) =>
    set({
      currentContent: content
    }),
  setCurrentNote: (note: Note | null) =>
    set({
      currentNote: note
    }),
  isLoading: false,
  error: null,

  createNote: async (title: string, content: string, folderPath = '', parentId?: number | null) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const newNote = await createNote(title, content, folderPath, parentId);

      // If the note has a parent folder, ensure it's open
      if (parentId && parentId !== null) {
        const folderStore = useFolderStore.getState();
        if (!folderStore.openFolderIds.includes(parentId)) {
          useFolderStore.getState().toggleFolder(parentId);
        }
      }

      set({
        notes: [...get().notes, newNote],
        currentNote: newNote,
        currentContent: newNote.content,
        isLoading: false
      });
      useFileStore.getState().loadFiles();
      return newNote; // Return the created note to match the function signature
    } catch (error) {
      set({
        error: String(error),
        isLoading: false
      });
      throw error;
    }
  },

  loadNote: async (id: number) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const note = await loadNote(id);
      set({
        currentNote: note,
        currentContent: note.content,
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
      throw error;
    }
  },

  loadNotes: async () => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const notes = await loadNotes();
      set({
        notes,
        isLoading: false
      });
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
      throw error;
    }
  },

  updateNote: async (id: number, title: string, content: string) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const updatedNote = await updateNote(id, title, content);
      set({
        notes: get().notes.map(note => (note.id === id ? updatedNote : note)),
        currentNote: updatedNote,
        currentContent: updatedNote.content,
        isLoading: false
      });
      useFileStore.getState().loadFiles();
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
      throw error;
    }
  },

  deleteNote: async (id: number) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      await deleteNote(id);
      set(state => {
        const isDeletingCurrentNote = state.currentNote?.id === id;
        return {
          notes: state.notes.filter(note => note.id !== id),
          currentNote: isDeletingCurrentNote ? null : state.currentNote,
          currentContent: isDeletingCurrentNote ? null : state.currentContent,
          isLoading: false
        };
      });
      useFileStore.getState().loadFiles();
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
      throw error;
    }
  },

  moveNote: async (id: number, newParentId: number | null) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const movedNote = await moveNote(id, newParentId);

      if (newParentId && newParentId !== null) {
        const folderStore = useFolderStore.getState();
        if (!folderStore.openFolderIds.includes(newParentId)) {
          useFolderStore.getState().toggleFolder(newParentId);
        }
      }

      set({
        notes: get().notes.map(note => (note.id === id ? movedNote : note)),
        currentNote: get().currentNote?.id === id ? movedNote : get().currentNote,
        isLoading: false
      });

      // Reload folders to reflect any changes in folder structure
      await useFolderStore.getState().loadFolders();
      useFileStore.getState().loadFiles();
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
      throw error;
    }
  }
}));
