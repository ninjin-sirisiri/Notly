import { create } from 'zustand';

import { getDeletedFolders, permanentlyDeleteFolder, restoreFolder } from '@/lib/api/folders';
import { getDeletedNotes, permanentlyDeleteNote, restoreNote } from '@/lib/api/notes';
import { type Folder } from '@/types/folders';
import { type Note } from '@/types/notes';

import { useFileStore } from './files';
import { useFolderStore } from './folders';
import { useNoteStore } from './notes';

type TrashStore = {
  deletedNotes: Note[];
  deletedFolders: Folder[];
  isLoading: boolean;
  error: string | null;

  loadDeletedItems: () => Promise<void>;
  restoreNote: (id: number) => Promise<void>;
  restoreFolder: (id: number) => Promise<void>;
  permanentlyDeleteNote: (id: number) => Promise<void>;
  permanentlyDeleteFolder: (id: number) => Promise<void>;
  emptyTrash: () => Promise<void>;
  restoreAll: () => Promise<void>;
};

export const useTrashStore = create<TrashStore>()((set, get) => ({
  deletedNotes: [],
  deletedFolders: [],
  isLoading: false,
  error: null,

  loadDeletedItems: async () => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const [notes, folders] = await Promise.all([getDeletedNotes(), getDeletedFolders()]);
      set({
        deletedNotes: notes,
        deletedFolders: folders,
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

  restoreNote: async (id: number) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      await restoreNote(id);
      set({
        deletedNotes: get().deletedNotes.filter(note => note.id !== id),
        isLoading: false
      });
      // Reload notes and files to reflect the restored note
      await useNoteStore.getState().loadNotes();
      await useFileStore.getState().loadFiles();
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
      throw error;
    }
  },

  restoreFolder: async (id: number) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      await restoreFolder(id);
      set({
        deletedFolders: get().deletedFolders.filter(folder => folder.id !== id),
        isLoading: false
      });
      // Reload folders and files to reflect the restored folder
      await useFolderStore.getState().loadFolders();
      await useFileStore.getState().loadFiles();
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
      throw error;
    }
  },

  permanentlyDeleteNote: async (id: number) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      await permanentlyDeleteNote(id);
      set({
        deletedNotes: get().deletedNotes.filter(note => note.id !== id),
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

  permanentlyDeleteFolder: async (id: number) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      await permanentlyDeleteFolder(id);
      set({
        deletedFolders: get().deletedFolders.filter(folder => folder.id !== id),
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

  emptyTrash: async () => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const { deletedNotes, deletedFolders } = get();

      // Delete all notes and folders
      await Promise.all([
        ...deletedNotes.map(note => permanentlyDeleteNote(note.id)),
        ...deletedFolders.map(folder => permanentlyDeleteFolder(folder.id))
      ]);

      set({
        deletedNotes: [],
        deletedFolders: [],
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

  restoreAll: async () => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const { deletedNotes, deletedFolders } = get();

      // Restore all notes and folders
      await Promise.all([
        ...deletedNotes.map(note => restoreNote(note.id)),
        ...deletedFolders.map(folder => restoreFolder(folder.id))
      ]);

      set({
        deletedNotes: [],
        deletedFolders: [],
        isLoading: false
      });

      // Reload all data
      await Promise.all([
        useNoteStore.getState().loadNotes(),
        useFolderStore.getState().loadFolders(),
        useFileStore.getState().loadFiles()
      ]);
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
      throw error;
    }
  }
}));
