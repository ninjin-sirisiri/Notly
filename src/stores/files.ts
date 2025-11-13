import { create } from 'zustand';

import { type FileItem } from '@/types/files';

import { getAllFiles } from '@/lib/api/files';
import { searchNotes } from '@/lib/api/notes';

type FileStore = {
  files: FileItem[];
  filteredFiles: FileItem[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  loadFiles: () => Promise<void>;
  setSearchQuery: (query: string) => void;
};

function collectFolderIds(items: FileItem[]): number[] {
  const folderIds: number[] = [];
  for (const item of items) {
    if ('folder' in item) {
      folderIds.push(item.folder.id);
      if (item.folder.children && item.folder.children.length > 0) {
        folderIds.push(...collectFolderIds(item.folder.children));
      }
    }
  }
  return folderIds;
}

async function filterFilesWithContent(files: FileItem[], query: string): Promise<FileItem[]> {
  if (!query.trim()) {
    return files;
  }

  const matchedNotes = await searchNotes(query);
  const matchedNoteIds = new Set(matchedNotes.map(n => n.id));

  function filterRecursive(items: FileItem[]): FileItem[] {
    const result: FileItem[] = [];
    for (const item of items) {
      if ('folder' in item) {
        const filteredChildren =
          item.folder.children && item.folder.children.length > 0
            ? filterRecursive(item.folder.children)
            : [];
        if (filteredChildren.length > 0) {
          result.push({
            folder: {
              ...item.folder,
              children: filteredChildren
            }
          });
        }
      } else if ('note' in item && matchedNoteIds.has(item.note.id)) {
        result.push(item);
      }
    }
    return result;
  }

  return filterRecursive(files);
}

export const useFileStore = create<FileStore>()((set, get) => ({
  files: [],
  filteredFiles: [],
  searchQuery: '',
  isLoading: false,
  error: null,

  loadFiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const files = await getAllFiles();
      const { searchQuery } = get();
      const filteredFiles = await filterFilesWithContent(files, searchQuery);
      set({ files, filteredFiles, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: String(error) });
      throw error;
    }
  },

  setSearchQuery: async (query: string) => {
    const { files } = get();
    const filteredFiles = await filterFilesWithContent(files, query);

    set({ searchQuery: query, filteredFiles });

    if (query.trim()) {
      const folderIds = collectFolderIds(filteredFiles);
      (async () => {
        const { useFolderStore } = await import('./folders');
        useFolderStore.getState().openFolders(folderIds);
      })();
    }
  }
}));
