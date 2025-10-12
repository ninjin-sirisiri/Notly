// src/electron/handlers/folder-handlers.ts
import { ipcMain } from 'electron';
import { getPrismaClient } from '../database';
import type {
  CreateFolderRequest,
  CreateFolderResponse,
  ListFoldersResponse,
  FolderTree,
} from '../../types/api';

export function registerFolderHandlers() {
  const prisma = getPrismaClient();

  ipcMain.handle(
    'FOLDER_CREATE',
    async (_, data: CreateFolderRequest): Promise<CreateFolderResponse> => {
      const folder = await prisma.folder.create({
        data: {
          name: data.name,
          parentId: data.parentId,
        },
      });
      return { folder };
    }
  );

  ipcMain.handle('FOLDER_LIST', async (): Promise<ListFoldersResponse> => {
    const allFolders = await prisma.folder.findMany({
      include: {
        children: true,
      },
    });

    const buildTree = (parentId: string | null): FolderTree[] => {
      return allFolders
        .filter((folder) => folder.parentId === parentId)
        .map((folder) => ({
          ...folder,
          children: buildTree(folder.id),
        }));
    };

    const folders = buildTree(null);
    return { folders };
  });

  ipcMain.handle('FOLDER_DELETE', async (_, id: string) => {
    await prisma.folder.delete({ where: { id } });
    return { success: true };
  });
}
