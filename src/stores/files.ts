import { create } from 'zustand';

import { type FileItem } from '@/types/files';

import { getAllFiles } from '@/lib/api/files';

type FileStore = {
  files: FileItem[];
  isLoading: boolean;
  error: string | null;
  loadFiles: () => Promise<void>;
};

export const useFileStore = create<FileStore>()(set => ({
  files: [],
  isLoading: false,
  error: null,

  loadFiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const files = await getAllFiles();
      set({ files, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: String(error) });
      throw error;
    }
  }
}));
