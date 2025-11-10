import { useEffect } from 'react';

import { useFolderStore } from '@/stores/folders';

export function useFolder() {
  const { folders, isLoading, error, loadFolder, loadFolders } = useFolderStore();

  useEffect(() => {
    loadFolders();
  }, [loadFolders]);

  return { folders, isLoading, error, loadFolder, loadFolders };
}

export function useCurrentFolder() {
  const { createFolder, setCurrentFolder, isLoading, error, loadFolder, updateFolder } =
    useFolderStore();

  return {
    createFolder,
    setCurrentFolder,
    isLoading,
    error,
    loadFolder,
    updateFolder
  };
}

export function useCreateFolder() {
  const { createFolder, isLoading, error } = useFolderStore();

  return { createFolder, isLoading, error };
}

export function useDeleteFolder() {
  const { deleteFolder, isLoading, error } = useFolderStore();

  return { deleteFolder, isLoading, error };
}

export function useUpdateFolder() {
  const { updateFolder, isLoading, error } = useFolderStore();

  return { updateFolder, isLoading, error };
}
