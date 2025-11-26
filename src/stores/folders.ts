import { create } from 'zustand';

import {
  createFolder,
  deleteFolder,
  loadFolder,
  loadFolders,
  moveFolder,
  updateFolder
} from '@/lib/api/folders';
import { type FolderWithChildren } from '@/types/files';

import { useFileStore } from './files';
import { useNoteStore } from './notes';

type FolderStore = {
  folders: FolderWithChildren[];
  currentFolder: FolderWithChildren | null;
  setCurrentFolder: (folder: FolderWithChildren | null) => void;
  isLoading: boolean;
  error: string | null;
  openFolderIds: number[];
  toggleFolder: (folderId: number) => void;
  openFolders: (folderIds: number[]) => void;
  expandAllFolders: () => void;
  collapseAllFolders: () => void;

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
  moveFolder: (id: number, newParentId: number | null) => Promise<void>;
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
  openFolders: (folderIds: number[]) =>
    set(state => ({
      openFolderIds: [...new Set([...state.openFolderIds, ...folderIds])]
    })),
  expandAllFolders: () =>
    set(state => ({
      openFolderIds: state.folders.map(folder => folder.id)
    })),
  collapseAllFolders: () =>
    set({
      openFolderIds: []
    }),

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
      const { currentNote, setCurrentNote } = useNoteStore.getState();
      const deletedFolder = get().folders.find(folder => folder.id === id);

      if (
        currentNote &&
        deletedFolder &&
        currentNote.file_path.startsWith(deletedFolder.folderPath)
      ) {
        setCurrentNote(null);
      }

      set(state => {
        const deletedFolder = state.folders.find(folder => folder.id === id);
        // Check if currentFolder should be cleared
        let shouldClearCurrentFolder = false;

        if (state.currentFolder?.id === id) {
          // Current folder is the one being deleted
          shouldClearCurrentFolder = true;
        } else if (state.currentFolder && deletedFolder) {
          // Check if current folder is within the deleted folder
          const currentPath = state.currentFolder.folderPath;
          const deletedPath = deletedFolder.folderPath;

          // Exact match
          if (currentPath === deletedPath) {
            shouldClearCurrentFolder = true;
          }
          // Check if current folder is a child of the deleted folder
          else if (currentPath.startsWith(deletedPath)) {
            // Make sure it's actually a subdirectory, not just a partial match
            const remainder = currentPath.slice(deletedPath.length);
            if (remainder.startsWith('/') || remainder.startsWith('\\')) {
              shouldClearCurrentFolder = true;
            }
          }
        }

        return {
          folders: state.folders.filter(folder => folder.id !== id),
          currentFolder: shouldClearCurrentFolder ? null : state.currentFolder,
          isLoading: false,
          error: null
        };
      });
      useFileStore.getState().loadFiles();
      // Refresh trash items
      const { useTrashStore } = await import('./trash');
      useTrashStore.getState().loadDeletedItems();
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
    }
  },

  moveFolder: async (id: number, newParentId: number | null) => {
    set({
      isLoading: true,
      error: null
    });
    try {
      await moveFolder(id, newParentId);

      if (newParentId && newParentId !== null) {
        const state = get();
        if (!state.openFolderIds.includes(newParentId)) {
          set(prevState => ({
            openFolderIds: [...prevState.openFolderIds, newParentId]
          }));
        }
      }

      set({
        isLoading: false,
        error: null
      });

      // Reload folders to reflect the updated structure
      await get().loadFolders();
      useFileStore.getState().loadFiles();
    } catch (error) {
      set({
        isLoading: false,
        error: String(error)
      });
    }
  }
}));
