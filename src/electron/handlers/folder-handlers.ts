// src/electron/handlers/folder-handlers.ts
import { ipcMain } from 'electron';
import fs from 'fs/promises';
import path from 'path';

import { getNotesPath, getPrismaClient } from '../database';

import type {
  CreateFolderRequest,
  CreateFolderResponse,
  ListFoldersResponse,
  FolderTree,
  UpdateFolderRequest,
} from '../../types/api';
export function registerFolderHandlers() {
  const prisma = getPrismaClient();

  // フォルダ作成
  ipcMain.handle(
    'FOLDER_CREATE',
    async (_, data: CreateFolderRequest): Promise<CreateFolderResponse> => {
      const notesPath = getNotesPath();
      const folderName = data.name;

      let folderPath: string;
      let relativePath: string;

      if (data.parentId) {
        const parentFolder = await prisma.folder.findUnique({
          where: { id: data.parentId },
        });
        if (!parentFolder) throw new Error('Folder not fount');

        folderPath = path.join(notesPath, parentFolder.folderPath, parentFolder.name, folderName);
        relativePath = path.join(parentFolder.folderPath, parentFolder.name);

        await fs.mkdir(folderPath, { recursive: true });
      } else {
        folderPath = path.join(notesPath, folderName);
        relativePath = '';

        await fs.mkdir(folderPath, { recursive: true });
      }

      // データベースに記録
      const folder = await prisma.folder.create({
        data: {
          name: data.name,
          parentId: data.parentId,
          folderPath: relativePath,
        },
      });
      return { folder };
    }
  );

  // フォルダ取得
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

  // フォルダ更新
  ipcMain.handle('FOLDER_UPDATE', async (_, data: UpdateFolderRequest) => {
    const notesPath = getNotesPath();
    const id = data.id;

    const folder = await prisma.folder.findUnique({ where: { id } });

    const folderPath = path.join(notesPath, folder?.folderPath!);
    const newFolderPath = path.join(notesPath, folder?.name!);

    fs.rename(folderPath, newFolderPath);

    const updatedFolder = await prisma.folder.update({
      where: { id: id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
      },
    });

    return { folder: updatedFolder };
  });

  // フォルダ削除
  ipcMain.handle('FOLDER_DELETE', async (_, id: string) => {
    const notesPath = getNotesPath();

    const folder = await prisma.folder.findUnique({ where: { id } });
    const folderPath = path.join(notesPath, folder?.folderPath!, folder?.name!);

    fs.rmdir(folderPath || '', { recursive: true });
    await prisma.folder.delete({ where: { id } });
    return { success: true };
  });
}
