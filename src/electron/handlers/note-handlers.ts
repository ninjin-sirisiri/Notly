import { ipcMain } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { getPrismaClient, getNotesPath } from '../database';
import type {
  CreateNoteRequest,
  CreateNoteResponse,
  ReadNoteRequest,
  ReadNoteResponse,
  UpdateNoteRequest,
  UpdateNoteResponse,
  DeleteNoteRequest,
  DeleteNoteResponse,
  ListNotesRequest,
  ListNotesResponse,
  SearchNotesRequest,
  SearchNotesResponse,
} from '../../types/api';

export function registerNoteHandlers() {
  const prisma = getPrismaClient();

  // ノート作成
  ipcMain.handle('NOTE_CREATE', async (_, data: CreateNoteRequest): Promise<CreateNoteResponse> => {
    const notesPath = getNotesPath();
    const fileName = `${data.title}.md`;

    // フォルダ内のパスを決定
    let filePath: string;
    let relativePath: string;

    if (data.folderId) {
      const folder = await prisma.folder.findUnique({
        where: { id: data.folderId },
      });
      if (!folder) throw new Error('Folder not found');

      const folderPath = path.join(notesPath, folder.folderPath);
      filePath = path.join(folderPath, folder.name, fileName);
      relativePath = path.join(folder.folderPath, folder.name);
      console.log(JSON.stringify(folder, null, 2));
    } else {
      filePath = path.join(notesPath, fileName);
      relativePath = '';
    }
    console.log(filePath, relativePath);

    // Markdownファイルを作成
    await fs.writeFile(filePath, data.content, 'utf-8');

    // データベースに記録
    const note = await prisma.note.create({
      data: {
        title: data.title,
        content: data.content,
        filePath: relativePath,
        folderId: data.folderId,
      },
    });

    // タグを関連付け
    if (data.tags && data.tags.length > 0) {
      await prisma.note.update({
        where: { id: note.id },
        data: {
          tags: {
            connectOrCreate: data.tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          },
        },
      });
    }

    // 統計を更新
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.stat.upsert({
      where: { date: today },
      update: {
        noteCount: { increment: 1 },
      },
      create: {
        date: today,
        noteCount: 1,
      },
    });

    return { note, filePath: relativePath };
  });

  // ノート読み込み
  ipcMain.handle('NOTE_READ', async (_, data: ReadNoteRequest): Promise<ReadNoteResponse> => {
    const notesPath = getNotesPath();

    const note = await prisma.note.findUnique({
      where: { id: data.id },
      include: {
        folder: true,
        tags: true,
      },
    });

    if (!note) throw new Error('Note not found');

    const fullPath = path.join(notesPath, note.filePath);
    const content = await fs.readFile(fullPath, 'utf-8');

    return { note, content };
  });

  // ノート更新
  ipcMain.handle('NOTE_UPDATE', async (_, data: UpdateNoteRequest): Promise<UpdateNoteResponse> => {
    const notesPath = getNotesPath();

    const note = await prisma.note.findUnique({
      where: { id: data.id },
    });

    if (!note) throw new Error('Note not found');

    // 新しいファイルパスを決定
    const newFileTitle = data.title !== undefined ? `${data.title}.md` : `${note.title}.md`;
    const newFileFullPath = path.join(note.filePath, newFileTitle);

    const oldFullPath = path.join(notesPath, note.filePath, `${note.title}.md`);
    const newFullPath = path.join(notesPath, newFileFullPath);

    // タイトルが変更された場合、ファイル名を変更
    if (data.title !== undefined && note.filePath !== newFileTitle) {
      await fs.rename(oldFullPath, newFullPath);
    }

    // コンテンツの更新（新しいファイルパスを使用）
    if (data.content !== undefined) {
      await fs.writeFile(newFullPath, data.content, 'utf-8');
    }

    // メタデータの更新
    const updatedNote = await prisma.note.update({
      where: { id: data.id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.folderId !== undefined && { folderId: data.folderId }),
      },
      include: {
        folder: true,
        tags: true,
      },
    });

    // タグの更新
    if (data.tags !== undefined) {
      await prisma.note.update({
        where: { id: data.id },
        data: {
          tags: {
            set: [],
            connectOrCreate: data.tags.map((tagName) => ({
              where: { name: tagName },
              create: { name: tagName },
            })),
          },
        },
      });
    }

    return { note: updatedNote };
  });

  // ノート削除
  ipcMain.handle('NOTE_DELETE', async (_, data: DeleteNoteRequest): Promise<DeleteNoteResponse> => {
    const notesPath = getNotesPath();

    const note = await prisma.note.findUnique({
      where: { id: data.id },
    });

    if (!note) throw new Error('Note not found');

    // ファイルを削除
    const fullPath = path.join(notesPath, note.filePath, `${note.title}.md`);
    try {
      await fs.unlink(fullPath);
    } catch (error) {
      console.error('Failed to delete file:', error);
    }

    // データベースから削除
    await prisma.note.delete({
      where: { id: data.id },
    });

    return { success: true };
  });

  // ノート一覧
  ipcMain.handle('NOTE_LIST', async (_, data?: ListNotesRequest): Promise<ListNotesResponse> => {
    interface NoteWhereInput {
      folderId?: string;
      tags?: {
        some: { id: string };
      };
      title?: {
        contains: string;
      };
    }

    const where: NoteWhereInput = {};

    if (data?.folderId) {
      where.folderId = data.folderId;
    }

    if (data?.tagId) {
      where.tags = {
        some: { id: data.tagId },
      };
    }

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where,
        include: {
          folder: true,
          tags: true,
        },
        orderBy: { createdAt: 'desc' },
        take: data?.limit || 100,
        skip: data?.offset || 0,
      }),
      prisma.note.count({ where }),
    ]);

    return { notes, total };
  });

  // ノート検索
  ipcMain.handle(
    'NOTE_SEARCH',
    async (_, data: SearchNotesRequest): Promise<SearchNotesResponse> => {
      const notesPath = getNotesPath();

      // データベースでタイトル検索
      interface NoteWhereInput {
        title?: {
          contains: string;
        };
        folderId?: string;
      }

      const where: NoteWhereInput = {
        title: {
          contains: data.query,
        },
      };

      if (data.folderId) {
        where.folderId = data.folderId;
      }

      const titleMatches = await prisma.note.findMany({
        where,
        include: {
          folder: true,
          tags: true,
        },
      });

      // ファイル内容も検索
      const allNotes = await prisma.note.findMany({
        where: data.folderId ? { folderId: data.folderId } : undefined,
      });

      const contentMatches = [];
      for (const note of allNotes) {
        const fullPath = path.join(notesPath, note.filePath);
        try {
          const content = await fs.readFile(fullPath, 'utf-8');
          if (content.toLowerCase().includes(data.query.toLowerCase())) {
            const noteWithRelations = await prisma.note.findUnique({
              where: { id: note.id },
              include: {
                folder: true,
                tags: true,
              },
            });
            if (noteWithRelations) {
              contentMatches.push(noteWithRelations);
            }
          }
        } catch (error) {
          console.error(`Failed to read note ${note.id}:`, error);
        }
      }

      // 重複を削除
      const noteMap = new Map();
      [...titleMatches, ...contentMatches].forEach((note) => {
        noteMap.set(note.id, note);
      });

      return { notes: Array.from(noteMap.values()) };
    }
  );
}
