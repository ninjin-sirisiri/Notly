import {
  createNote,
  deleteNote,
  loadNote,
  loadNotes,
  updateNote
} from '@/lib/api/notes';
import { Note, NoteWithContent } from '@/types/notes';
import { create } from 'zustand';

type NoteStore = {
  notes: Note[];
  currentNote: NoteWithContent | null;
  currentContent: string | null;
  setCurrentNote: (note: NoteWithContent | null) => void;
  setCurrentContent: (content: string | null) => void;
  isLoading: boolean;
  error: string | null;

  createNote: (
    title: string,
    content: string,
    folderPath: string,
    parentId?: number
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
  setCurrentNote: (note: NoteWithContent | null) => set({ currentNote: note }),
  setCurrentContent: (content: string | null) =>
    set({ currentContent: content }),
  isLoading: false,
  error: null,

  createNote: async (
    title: string,
    content: string,
    folderPath: string = '',
    parentId?: number
  ) => {
    set({ isLoading: true, error: null });
    try {
      const newNote = await createNote(title, content, folderPath, parentId);
      set({ notes: [...get().notes, newNote], isLoading: false });
      return newNote;
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  loadNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const notes = await loadNotes();
      set({ notes, isLoading: false });
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  loadNote: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const note = await loadNote(id);
      set({
        currentNote: note,
        currentContent: note.content,
        isLoading: false
      });
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  updateNote: async (id: number, title: string, content: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedNote = await updateNote(id, title, content);
      set({
        notes: get().notes.map(note => (note.id === id ? updatedNote : note)),
        isLoading: false
      });
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  },

  deleteNote: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await deleteNote(id);
      set({
        notes: get().notes.filter(note => note.id !== id),
        isLoading: false
      });
    } catch (error) {
      set({ error: String(error), isLoading: false });
      throw error;
    }
  }
}));
