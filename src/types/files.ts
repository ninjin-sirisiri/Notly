import { type Note } from './notes';

export type FolderWithChildren = {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  parentId: number | null;
  folderPath: string;
  children: FileItem[];
  icon?: string;
  color?: string;
};

export type FileItem = { folder: FolderWithChildren } | { note: Note };
