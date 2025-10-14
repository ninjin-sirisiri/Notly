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

  // ipcMain.handle('FOLDER_UPDATE', async (_, data: UpdateFolderRequest) => {
  //   const notesPath = getNotesPath();
  //   const id = data.id;

  //   const folder = await prisma.folder.findUnique({ where: { id } });

  //   const folderPath = path.join(notesPath, folder?.folderPath || '');
  //   const newFolderPath = path.join(notesPath, folder?.name || '');

  //   fs.rename(folderPath, newFolderPath);

  //   const updatedFolder = await prisma.folder.update({
  //     where: { id: id },
  //     data: {
  //       ...(data.name !== undefined && { name: data.name }),
  //     },
  //   });

  //   return { folder: updatedFolder };
  // });

  // フォルダ名更新
  ipcMain.handle('FOLDER_UPDATE_FOLDER_NAME', async (_, data: UpdateFolderRequest) => {
    const { id, name } = data;
    const notesPath = getNotesPath();

    const targetFolder = await prisma.folder.findUnique({ where: { id } });
    if (!targetFolder) throw new Error('Folder not found');

    const oldFullPath = path.join(targetFolder.folderPath, targetFolder.name);
    const newFullPath = path.join(targetFolder.folderPath, name);

    const oldFSPath = path.join(notesPath, oldFullPath);
    const newFSPath = path.join(notesPath, newFullPath);

    // 1. ファイルシステムのリネーム
    try {
      await fs.rename(oldFSPath, newFSPath);
    } catch (error) {
      console.error(`Rename failed: ${oldFSPath} -> ${newFSPath}`, error);
      throw new Error('Failed to rename folder on filesystem');
    }

    // 2. DB更新
    try {
      const allFolders = await prisma.folder.findMany();
      const descendants: any[] = [];
      const findDescendantsRecursively = (parentId: string) => {
        const children = allFolders.filter((f) => f.parentId === parentId);
        for (const child of children) {
          descendants.push(child);
          findDescendantsRecursively(child.id);
        }
      };
      findDescendantsRecursively(id);

      await prisma.$transaction(async (tx) => {
        // a. 対象フォルダ自身の名前を更新
        await tx.folder.update({
          where: { id },
          data: { name },
        });

        // b. 対象フォルダに直接属するノートの filePath を更新
        await tx.note.updateMany({
          where: { folderId: id },
          data: { filePath: newFullPath },
        });

        // c. 子孫フォルダの folderPath と、それに属するノートの filePath を更新
        for (const descendant of descendants) {
          const oldParentPath = descendant.folderPath;
          const newParentPath = oldParentPath.startsWith(oldFullPath)
            ? newFullPath + oldParentPath.substring(oldFullPath.length)
            : oldParentPath;

          // フォルダの folderPath (親パス) を更新
          await tx.folder.update({
            where: { id: descendant.id },
            data: { folderPath: newParentPath },
          });

          // この子孫フォルダに属するノートの filePath を更新
          const newNotePath = path.join(newParentPath, descendant.name);
          await tx.note.updateMany({
            where: { folderId: descendant.id },
            data: { filePath: newNotePath },
          });
        }
      });
    } catch (dbError) {
      console.error('DB update failed after rename:', dbError);
      // ロールバック
      await fs.rename(newFSPath, oldFSPath).catch((rbError) => {
        console.error('Filesystem rollback failed:', rbError);
      });
      throw new Error('Failed to update database');
    }

    return { success: true };
  });

  // フォルダ削除
  ipcMain.handle('FOLDER_DELETE', async (_, id: string) => {
    const notesPath = getNotesPath();

    const folder = await prisma.folder.findUnique({ where: { id } });
    const folderPath = path.join(notesPath, folder?.folderPath || '', folder?.name || '');

    fs.rmdir(folderPath || '', { recursive: true });
    await prisma.folder.delete({ where: { id } });
    return { success: true };
  });
}
