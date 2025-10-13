import type { Note, Folder, Tag } from './database';

// ノート作成
export interface CreateNoteRequest {
  title: string;
  content: string;
  folderId?: string;
  tags?: string[];
}

export interface CreateNoteResponse {
  note: Note;
  filePath: string;
}

// ノート読み込み
export interface ReadNoteRequest {
  id: string;
}

export interface ReadNoteResponse {
  note: Note;
  content: string;
}

// ノート更新
export interface UpdateNoteRequest {
  id: string;
  title?: string;
  content?: string;
  folderId?: string;
  tags?: string[];
}

export interface UpdateNoteResponse {
  note: Note;
}

// ノート削除
export interface DeleteNoteRequest {
  id: string;
}

export interface DeleteNoteResponse {
  success: boolean;
}

// ノート一覧
export interface ListNotesRequest {
  folderId?: string;
  tagId?: string;
  limit?: number;
  offset?: number;
}

export interface ListNotesResponse {
  notes: Note[];
  total: number;
}

// ノート検索
export interface SearchNotesRequest {
  query: string;
  folderId?: string;
}

export interface SearchNotesResponse {
  notes: Note[];
}

// フォルダ作成
export interface CreateFolderRequest {
  name: string;
  parentId?: string;
}

export interface CreateFolderResponse {
  folder: Folder;
}

// フォルダ一覧（ツリー構造）
export interface ListFoldersResponse {
  folders: FolderTree[];
}

export interface FolderTree extends Folder {
  children: FolderTree[];
}

// タグ作成
export interface CreateTagRequest {
  name: string;
  color?: string;
}

export interface CreateTagResponse {
  tag: Tag;
}

// テンプレート
export interface Template {
  id: string;
  name: string;
  content: string;
}

export interface CreateTemplateRequest {
  name: string;
  content: string;
}

export interface CreateTemplateResponse {
  template: Template;
}

// 統計情報
export interface StatsResponse {
  currentStreak: number;
  longestStreak: number;
  totalNotes: number;
  monthlyStats: {
    date: string;
    count: number;
  }[];
}

// 設定
export interface SettingsResponse {
  notificationEnabled: boolean;
  notificationTimes: string[];
  theme: 'light' | 'dark' | 'system';
}

export interface UpdateSettingsRequest {
  notificationEnabled?: boolean;
  notificationTimes?: string[];
  theme?: 'light' | 'dark' | 'system';
}
