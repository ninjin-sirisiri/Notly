import { create } from 'zustand';

import { createNote, deleteNote, loadNote, loadNotes, updateNote } from '@/lib/api/notes';
import { type Note, type NoteWithContent } from '@/types/notes';

import { useFileStore } from './files';

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
      set({
        notes: [...get().notes, newNote],
        currentNote: newNote,
        currentContent: newNote.content,
        isLoading: false
      });
      useFileStore.getState().loadFiles();
      // Removed direct dependency on useFolderStore to break circular dependency
      // if (newNote.parent_id) {
      //   const { openFolderIds, toggleFolder } = useFolderStore.getState();
      //   if (!openFolderIds.includes(newNote.parent_id)) {
      //     toggleFolder(newNote.parent_id);
      //   }
      // }
      return newNote;
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
  }
}));
