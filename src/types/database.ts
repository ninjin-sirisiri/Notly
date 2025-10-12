// src/types/database.ts
import { Prisma } from '@prisma/client';

// 各モデルの型定義
export type Note = Prisma.NoteGetPayload<{}>;
export type Folder = Prisma.FolderGetPayload<{}>;
export type Tag = Prisma.TagGetPayload<{}>;
export type Stat = Prisma.StatGetPayload<{}>;
export type Setting = Prisma.SettingGetPayload<{}>;

// リレーションを含む型定義
export type NoteWithRelations = Prisma.NoteGetPayload<{
  include: {
    folder: true;
    tags: true;
  };
}>;

export type FolderWithRelations = Prisma.FolderGetPayload<{
  include: {
    parent: true;
    children: true;
    notes: true;
  };
}>;
