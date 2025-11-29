import { type Folder } from '@/types/folders';
import { type Note } from '@/types/notes';

export type TrashNode =
  | { type: 'folder'; data: Folder; children: TrashNode[] }
  | { type: 'note'; data: Note };

export function buildTrashTree(notes: Note[], folders: Folder[]): TrashNode[] {
  const folderMap = new Map<number, TrashNode & { type: 'folder' }>();
  const rootNodes: TrashNode[] = [];

  // 1. フォルダをマップに登録
  for (const folder of folders) {
    folderMap.set(folder.id, { type: 'folder', data: folder, children: [] });
  }

  // 2. フォルダの親子関係を構築
  for (const folder of folders) {
    const node = folderMap.get(folder.id);
    if (!node) continue;

    if (folder.parent_id && folderMap.has(folder.parent_id)) {
      folderMap.get(folder.parent_id)?.children.push(node);
    } else {
      rootNodes.push(node);
    }
  }

  // 3. ノートを配置
  for (const note of notes) {
    const node: TrashNode = { type: 'note', data: note };
    if (note.parent_id && folderMap.has(note.parent_id)) {
      folderMap.get(note.parent_id)?.children.push(node);
    } else {
      rootNodes.push(node);
    }
  }

  return rootNodes;
}

export function findNode(
  nodes: TrashNode[],
  type: 'note' | 'folder',
  id: number
): TrashNode | null {
  for (const node of nodes) {
    const nodeId = node.type === 'folder' ? node.data.id : node.data.id;
    if (node.type === type && nodeId === id) {
      return node;
    }
    if (node.type === 'folder' && node.children) {
      const found = findNode(node.children, type, id);
      if (found) return found;
    }
  }
  return null;
}

export function getAllDescendantKeys(node: TrashNode): string[] {
  const nodeId = node.type === 'folder' ? node.data.id : node.data.id;
  const keys: string[] = [`${node.type}-${nodeId}`];

  if (node.type === 'folder' && node.children) {
    for (const child of node.children) {
      keys.push(...getAllDescendantKeys(child));
    }
  }
  return keys;
}

export type TrashFlattenedItem = {
  node: TrashNode;
  depth: number;
  index: number;
};

export function flattenTrashNodes(
  nodes: TrashNode[],
  expandedFolderIds: Set<number>,
  depth = 0,
  result: TrashFlattenedItem[] = []
): TrashFlattenedItem[] {
  for (const node of nodes) {
    result.push({
      node,
      depth,
      index: result.length
    });

    if (node.type === 'folder' && expandedFolderIds.has(node.data.id) && node.children.length > 0) {
      flattenTrashNodes(node.children, expandedFolderIds, depth + 1, result);
    }
  }
  return result;
}
