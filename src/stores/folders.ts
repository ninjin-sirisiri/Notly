import { create } from 'zustand';

import {
  createFolder,
  deleteFolder,
  loadFolder,
  loadFolders,
  updateFolder
} from '@/lib/api/folders';
import { type Folder } from '@/types/folders';

type FolderStore = {
  folders: Folder[];
  currentFolder: Folder | null;
  isLoading: boolean;
  error: string | null;

  createFolder: (name: string, parentPath: string, parentId?: number) => Promise<void>;
  loadFolders: () => Promise<void>;
  loadFolder: (id: number) => Promise<void>;
  updateFolder: (id: number, name: string, parentPath: string, parentId?: number) => Promise<void>;
  deleteFolder: (id: number) => Promise<void>;
};

export const useFolderStore = create<FolderStore>()((set, get) => ({
  folders: [],
  currentFolder: null,
  isLoading: false,
  error: null,

  createFolder: async (name: string, parentPath = '', parentId?: number) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const newFolder = await createFolder(name, parentPath, parentId);
      set({
        folders: [...get().folders, newFolder],
        currentFolder: newFolder,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
    }
  },

  loadFolders: async () => {
    set({ isLoading: false, error: null });
    try {
      const folders = await loadFolders();
      set({
        folders,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
    }
  },

  loadFolder: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      const folder = await loadFolder(id);
      set({
        currentFolder: folder,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
    }
  },

  updateFolder: async (id: number, name: string, parentPath = '', parentId?: number) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const updatedFolder = await updateFolder(id, name, parentPath, parentId);
      set({
        folders: get().folders.map(folder => (folder.id === id ? updatedFolder : folder)),
        currentFolder: updatedFolder,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
    }
  },

  deleteFolder: async (id: number) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      await deleteFolder(id);
      set({
        folders: get().folders.filter(folder => folder.id !== id),
        currentFolder: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
    }
  }
}));
