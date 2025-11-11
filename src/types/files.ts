import { type Note } from './notes';

export type FolderWithChildren = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  parentId: number | null;
  folderPath: string;
  children: FileItem[];
};

export type FileItem = { folder: FolderWithChildren } | { note: Note };
