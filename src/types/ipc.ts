// src/types/ipc.ts

export const IPC_CHANNELS = {
  // ノート操作
  NOTE_CREATE: 'note:create',
  NOTE_READ: 'note:read',
  NOTE_UPDATE: 'note:update',
  NOTE_DELETE: 'note:delete',
  NOTE_LIST: 'note:list',
  NOTE_SEARCH: 'note:search',

  // フォルダ操作
  FOLDER_CREATE: 'folder:create',
  FOLDER_READ: 'folder:read',
  FOLDER_UPDATE: 'folder:update',
  FOLDER_DELETE: 'folder:delete',
  FOLDER_LIST: 'folder:list',
  FOLDER_MOVE: 'folder:move',

  // タグ操作
  TAG_CREATE: 'tag:create',
  TAG_LIST: 'tag:list',
  TAG_DELETE: 'tag:delete',
  TAG_ATTACH: 'tag:attach',
  TAG_DETACH: 'tag:detach',

  // テンプレート操作
  TEMPLATE_CREATE: 'template:create',
  TEMPLATE_READ: 'template:read',
  TEMPLATE_UPDATE: 'template:update',
  TEMPLATE_DELETE: 'template:delete',
  TEMPLATE_LIST: 'template:list',

  // 統計情報
  STATS_GET: 'stats:get',
  STATS_UPDATE: 'stats:update',

  // 設定
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // パス取得
  PATH_GET_USER_DATA: 'path:getUserData',
  PATH_GET_NOTES: 'path:getNotes',
} as const;
