// src/electron/preload.ts
import { contextBridge, ipcRenderer } from 'electron';

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
  CreateFolderRequest,
  CreateFolderResponse,
  ListFoldersResponse,
  CreateTagRequest,
  CreateTagResponse,
  CreateTemplateRequest,
  CreateTemplateResponse,
  StatsResponse,
  SettingsResponse,
  UpdateSettingsRequest,
  Template,
} from '../types/api';
import type { Tag } from '../types/database';

const api = {
  // ノート操作
  note: {
    create: (data: CreateNoteRequest): Promise<CreateNoteResponse> =>
      ipcRenderer.invoke('NOTE_CREATE', data),

    read: (data: ReadNoteRequest): Promise<ReadNoteResponse> =>
      ipcRenderer.invoke('NOTE_READ', data),

    update: (data: UpdateNoteRequest): Promise<UpdateNoteResponse> =>
      ipcRenderer.invoke('NOTE_UPDATE', data),

    delete: (data: DeleteNoteRequest): Promise<DeleteNoteResponse> =>
      ipcRenderer.invoke('NOTE_DELETE', data),

    list: (data?: ListNotesRequest): Promise<ListNotesResponse> =>
      ipcRenderer.invoke('NOTE_LIST', data),

    search: (data: SearchNotesRequest): Promise<SearchNotesResponse> =>
      ipcRenderer.invoke('NOTE_SEARCH', data),
  },

  // フォルダ操作
  folder: {
    create: (data: CreateFolderRequest): Promise<CreateFolderResponse> =>
      ipcRenderer.invoke('FOLDER_CREATE', data),

    list: (): Promise<ListFoldersResponse> => ipcRenderer.invoke('FOLDER_LIST'),

    delete: (id: string): Promise<{ success: boolean }> => ipcRenderer.invoke('FOLDER_DELETE', id),
  },

  // タグ操作
  tag: {
    create: (data: CreateTagRequest): Promise<CreateTagResponse> =>
      ipcRenderer.invoke('TAG_CREATE', data),

    list: (): Promise<{ tags: Tag[] }> => ipcRenderer.invoke('TAG_LIST'),

    delete: (id: string): Promise<{ success: boolean }> => ipcRenderer.invoke('TAG_DELETE', id),
  },

  // テンプレート操作
  template: {
    create: (data: CreateTemplateRequest): Promise<CreateTemplateResponse> =>
      ipcRenderer.invoke('TEMPLATE_CREATE', data),

    list: (): Promise<{ templates: Template[] }> => ipcRenderer.invoke('TEMPLATE_LIST'),

    read: (id: string): Promise<{ template: Template }> => ipcRenderer.invoke('TEMPLATE_READ', id),

    delete: (id: string): Promise<{ success: boolean }> =>
      ipcRenderer.invoke('TEMPLATE_DELETE', id),
  },

  // 統計情報
  stats: {
    get: (): Promise<StatsResponse> => ipcRenderer.invoke('STATS_GET'),
  },

  // 設定
  settings: {
    get: (): Promise<SettingsResponse> => ipcRenderer.invoke('SETTINGS_GET'),

    set: (data: UpdateSettingsRequest): Promise<SettingsResponse> =>
      ipcRenderer.invoke('SETTINGS_SET', data),
  },

  // その他
  platform: process.platform,
};

contextBridge.exposeInMainWorld('api', api);

// 型定義をエクスポート
export type ElectronAPI = typeof api;
