import { ipcMain } from 'electron';
import { getPrismaClient } from '../database';
import type { CreateTagRequest, CreateTagResponse } from '../../types/api';

export function registerTagHandlers() {
  const prisma = getPrismaClient();

  ipcMain.handle('TAG_CREATE', async (_, data: CreateTagRequest): Promise<CreateTagResponse> => {
    const tag = await prisma.tag.create({
      data: {
        name: data.name,
        color: data.color,
      },
    });
    return { tag };
  });

  ipcMain.handle('TAG_LIST', async () => {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { notes: true },
        },
      },
    });
    return { tags };
  });

  ipcMain.handle('TAG_DELETE', async (_, id: string) => {
    await prisma.tag.delete({ where: { id } });
    return { success: true };
  });
}
