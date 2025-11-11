import { create } from 'zustand';

import {
  createFolder,
  deleteFolder,
  loadFolder,
  loadFolders,
  updateFolder
} from '@/lib/api/folders';
import { type FolderWithChildren } from '@/types/files';

import { useFileStore } from './files';

type FolderStore = {
  folders: FolderWithChildren[];
  currentFolder: FolderWithChildren | null;
  setCurrentFolder: (folder: FolderWithChildren | null) => void;
  isLoading: boolean;
  error: string | null;
  openFolderIds: number[];
  toggleFolder: (folderId: number) => void;

  createFolder: (name: string, parentPath: string, parentId?: number | null) => Promise<void>;
  loadFolders: () => Promise<void>;
  loadFolder: (id: number) => Promise<void>;
  updateFolder: (
    id: number,
    name: string,
    parentPath: string,
    parentId?: number | null
  ) => Promise<void>;
  deleteFolder: (id: number) => Promise<void>;
};

export const useFolderStore = create<FolderStore>()((set, get) => ({
  folders: [],
  currentFolder: null,
  setCurrentFolder: (folder: FolderWithChildren | null) => set({ currentFolder: folder }),
  isLoading: false,
  error: null,
  openFolderIds: [],
  toggleFolder: (folderId: number) =>
    set(state => ({
      openFolderIds: state.openFolderIds.includes(folderId)
        ? state.openFolderIds.filter(id => id !== folderId)
        : [...state.openFolderIds, folderId]
    })),

  createFolder: async (name: string, parentPath = '', parentId?: number | null) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const newFolder = await createFolder(name, parentPath, parentId);
      const newFolderWithChildren: FolderWithChildren = {
        id: newFolder.id,
        name: newFolder.name,
        createdAt: newFolder.created_at as unknown as string,
        updatedAt: newFolder.updated_at as unknown as string,
        parentId: newFolder.parent_id ?? null,
        folderPath: newFolder.folder_path,
        children: []
      };
      set(state => {
        const newOpenFolderIds = [...state.openFolderIds, newFolderWithChildren.id];
        if (
          newFolderWithChildren.parentId &&
          !newOpenFolderIds.includes(newFolderWithChildren.parentId)
        ) {
          newOpenFolderIds.push(newFolderWithChildren.parentId);
        }
        return {
          folders: [...state.folders, newFolderWithChildren],
          currentFolder: newFolderWithChildren,
          isLoading: false,
          error: null,
          openFolderIds: newOpenFolderIds
        };
      });
      useFileStore.getState().loadFiles();
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
      const foldersWithChildren: FolderWithChildren[] = folders.map(folder => ({
        id: folder.id,
        name: folder.name,
        createdAt: folder.created_at as unknown as string,
        updatedAt: folder.updated_at as unknown as string,
        parentId: folder.parent_id ?? null,
        folderPath: folder.folder_path,
        children: []
      }));
      set({
        folders: foldersWithChildren,
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
      const folderWithChildren: FolderWithChildren = {
        id: folder.id,
        name: folder.name,
        createdAt: folder.created_at as unknown as string,
        updatedAt: folder.updated_at as unknown as string,
        parentId: folder.parent_id ?? null,
        folderPath: folder.folder_path,
        children: []
      };
      set({
        currentFolder: folderWithChildren,
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

  updateFolder: async (id: number, name: string, parentPath = '', parentId?: number | null) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      const updatedFolder = await updateFolder(id, name, parentPath, parentId);
      const updatedFolderWithChildren: FolderWithChildren = {
        id: updatedFolder.id,
        name: updatedFolder.name,
        createdAt: updatedFolder.created_at as unknown as string,
        updatedAt: updatedFolder.updated_at as unknown as string,
        parentId: updatedFolder.parent_id ?? null,
        folderPath: updatedFolder.folder_path,
        children: []
      };
      set(state => ({
        folders: state.folders.map(folder =>
          folder.id === id ? updatedFolderWithChildren : folder
        ),
        currentFolder: updatedFolderWithChildren,
        isLoading: false,
        error: null
      }));
      useFileStore.getState().loadFiles();
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
      useFileStore.getState().loadFiles();
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
    }
  }
}));
