// src/electron/database.ts
import { app } from "electron";
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import os from "os";

// Electron環境かどうかを判定
const isElectron = typeof app !== "undefined" && app.getPath;

// ユーザーデータディレクトリのパス
export const getUserDataPath = () => {
  if (isElectron) {
    return path.join(app.getPath("home"), "Notly");
  } else {
    // テスト環境用（ホームディレクトリ/Notly-dev）
    return path.join(os.homedir(), "Notly-dev");
  }
};

// データベースファイルのパス
export const getDatabasePath = () => {
  const userDataPath = getUserDataPath();
  return path.join(userDataPath, ".metadata", "app.db");
};

// ノートディレクトリのパス
export const getNotesPath = () => {
  return path.join(getUserDataPath(), "notes");
};

// テンプレートディレクトリのパス
export const getTemplatesPath = () => {
  return path.join(getUserDataPath(), "templates");
};

// 必要なディレクトリを作成
export const ensureDirectories = () => {
  const userDataPath = getUserDataPath();
  const metadataPath = path.join(userDataPath, ".metadata");
  const notesPath = getNotesPath();
  const templatesPath = getTemplatesPath();

  [userDataPath, metadataPath, notesPath, templatesPath].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

// Prisma Clientのインスタンス
let prisma: PrismaClient | null = null;

export const getPrismaClient = () => {
  if (!prisma) {
    // 必要なディレクトリを作成
    ensureDirectories();

    // データベースURLを動的に設定
    const databasePath = getDatabasePath();
    process.env.DATABASE_URL = `file:${databasePath}`;

    prisma = new PrismaClient();
  }
  return prisma;
};

// アプリ終了時にPrismaを切断
export const disconnectPrisma = async () => {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
};
