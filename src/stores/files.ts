import { create } from 'zustand';

import { type FileItem } from '@/types/files';

import { getAllFiles } from '@/lib/api/files';
import { searchNotes } from '@/lib/api/notes';
import { useFolderStore } from './folders';

type SortBy = 'name' | 'createdAt' | 'updatedAt';
type SortOrder = 'asc' | 'desc';

type FileStore = {
  files: FileItem[];
  filteredFiles: FileItem[];
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
  loadFiles: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  sortBy: SortBy;
  sortOrder: SortOrder;
  setSortBy: (sortBy: SortBy) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
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

function sortFiles(files: FileItem[], sortBy: SortBy, sortOrder: SortOrder): FileItem[] {
  return [...files].toSorted((a, b) => {
    const aIsFolder = 'folder' in a;
    const bIsFolder = 'folder' in b;

    if (aIsFolder && !bIsFolder) return -1;
    if (!aIsFolder && bIsFolder) return 1;

    function getTime(item: FileItem): number {
      const isFolder = 'folder' in item;
      if (sortBy === 'createdAt') {
        return new Date(isFolder ? item.folder.createdAt : item.note.created_at).getTime();
      }
      return new Date(isFolder ? item.folder.updatedAt : item.note.updated_at).getTime();
    }

    let comparison = 0;

    if (sortBy === 'name') {
      const aName = aIsFolder ? a.folder.name : a.note.title;
      const bName = bIsFolder ? b.folder.name : b.note.title;
      comparison = aName.localeCompare(bName);
    } else {
      comparison = getTime(a) - getTime(b);
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });
}

export const useFileStore = create<FileStore>()((set, get) => ({
  files: [],
  filteredFiles: [],
  searchQuery: '',
  isLoading: false,
  error: null,
  sortBy: 'name',
  sortOrder: 'asc',

  loadFiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const files = await getAllFiles();
      const { searchQuery, sortBy, sortOrder } = get();
      const filteredFiles = await filterFilesWithContent(files, searchQuery);
      const sortedFiles = sortFiles(filteredFiles, sortBy, sortOrder);
      set({ files, filteredFiles: sortedFiles, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: String(error) });
      throw error;
    }
  },

  setSearchQuery: async (query: string) => {
    const { files, sortBy, sortOrder } = get();
    const filteredFiles = await filterFilesWithContent(files, query);
    const sortedFiles = sortFiles(filteredFiles, sortBy, sortOrder);

    set({ searchQuery: query, filteredFiles: sortedFiles });

    if (query.trim()) {
      const folderIds = collectFolderIds(filteredFiles);
      useFolderStore.getState().openFolders(folderIds);
    }
  },

  setSortBy: sortBy => {
    const { filteredFiles, sortOrder } = get();
    const sortedFiles = sortFiles(filteredFiles, sortBy, sortOrder);
    set({ sortBy, filteredFiles: sortedFiles });
  },

  setSortOrder: sortOrder => {
    const { filteredFiles, sortBy } = get();
    const sortedFiles = sortFiles(filteredFiles, sortBy, sortOrder);
    set({ sortOrder, filteredFiles: sortedFiles });
  }
}));
