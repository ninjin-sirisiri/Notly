import { type Folder } from '@/types/folders';

import { safeInvoke } from '../tauri';

export function createFolder(
  name: string,
  parentPath = '',
  parentId: number | null = null
): Promise<Folder> {
  return safeInvoke<Folder>('create_folder', {
    input: {
      name,
      parent_path: parentPath,
      parent_id: parentId
    }
  });
}

export function loadFolders(): Promise<Folder[]> {
  return safeInvoke<Folder[]>('load_folders', {});
}

export function loadFolder(id: number): Promise<Folder> {
  return safeInvoke<Folder>('load_folder', {
    id
  });
}

export function updateFolder(
  id: number,
  name: string,
  parentPath = '',
  parentId: number | null = null
): Promise<Folder> {
  return safeInvoke<Folder>('update_folder', {
    input: {
      id,
      name,
      parent_path: parentPath,
      parent_id: parentId
    }
  });
}

export function deleteFolder(id: number): Promise<void> {
  return safeInvoke<void>('delete_folder', {
    id
  });
}

export function moveFolder(id: number, newParentId: number | null): Promise<Folder> {
  return safeInvoke<Folder>('move_folder', {
    input: {
      id,
      new_parent_id: newParentId
    }
  });
}
