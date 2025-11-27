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
  return safeInvoke<Folder[]>('get_all_folders', {});
}

export function loadFolder(id: number): Promise<Folder> {
  return safeInvoke<Folder>('get_folder_by_id', {
    id
  });
}

export function updateFolder(
  id: number,
  name: string,
  parentPath = '',
  parentId: number | null = null,
  icon?: string | null,
  color?: string | null,
  sortBy?: string | null,
  sortOrder?: string | null
): Promise<Folder> {
  return safeInvoke<Folder>('update_folder', {
    input: {
      id,
      name,
      parent_path: parentPath,
      parent_id: parentId,
      icon,
      color,
      sort_by: sortBy,
      sort_order: sortOrder
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

export function restoreFolder(id: number): Promise<void> {
  return safeInvoke<void>('restore_folder', { id });
}

export function permanentlyDeleteFolder(id: number): Promise<void> {
  return safeInvoke<void>('permanently_delete_folder', { id });
}

export function getDeletedFolders(): Promise<Folder[]> {
  return safeInvoke<Folder[]>('get_deleted_folders');
}
