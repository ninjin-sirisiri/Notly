// src/hooks/useFolders.ts
import { useState, useEffect } from "react";
import type { FolderTree } from "../types/api";

export function useFolders() {
  const [folders, setFolders] = useState<FolderTree[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const result = await window.api.folder.list();
      setFolders(result.folders);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFolders();
  }, []);

  const createFolder = async (name: string, parentId?: string) => {
    const result = await window.api.folder.create({ name, parentId });
    await loadFolders();
    return result;
  };

  const deleteFolder = async (id: string) => {
    await window.api.folder.delete(id);
    await loadFolders();
  };

  return {
    folders,
    loading,
    error,
    createFolder,
    deleteFolder,
    refresh: loadFolders,
  };
}
