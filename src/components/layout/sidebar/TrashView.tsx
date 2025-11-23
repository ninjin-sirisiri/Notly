import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder as FolderIcon,
  RotateCcw,
  Trash2,
  X
} from 'lucide-react';
import { useMemo, useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useTrashStore } from '@/stores/trash';
import { type Folder } from '@/types/folders';
import { type Note } from '@/types/notes';

type TrashNode =
  | { type: 'folder'; data: Folder; children: TrashNode[] }
  | { type: 'note'; data: Note };

function buildTrashTree(notes: Note[], folders: Folder[]): TrashNode[] {
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

function findNode(nodes: TrashNode[], type: 'note' | 'folder', id: number): TrashNode | null {
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

function getAllDescendantKeys(node: TrashNode): string[] {
  const nodeId = node.type === 'folder' ? node.data.id : node.data.id;
  const keys: string[] = [`${node.type}-${nodeId}`];

  if (node.type === 'folder' && node.children) {
    for (const child of node.children) {
      keys.push(...getAllDescendantKeys(child));
    }
  }
  return keys;
}

function TrashItem({
  node,
  depth = 0,
  selectedItems,
  onCheck,
  onRestore,
  onDelete
}: {
  node: TrashNode;
  depth?: number;
  selectedItems: Set<string>;
  onCheck: (type: 'note' | 'folder', id: number) => void;
  onRestore: (type: 'note' | 'folder', id: number) => void;
  onDelete: (type: 'note' | 'folder', id: number) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const isFolder = node.type === 'folder';
  const hasChildren = isFolder && node.children.length > 0;
  const itemId = isFolder ? node.data.id : node.data.id;
  const isChecked = selectedItems.has(`${node.type}-${itemId}`);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (isFolder) {
      setIsOpen(!isOpen);
    }
  }

  return (
    <div>
      <div
        className="group flex items-center justify-between py-1 px-2 hover:bg-accent/50 rounded-sm cursor-default text-sm"
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleToggle}>
        <div className="flex items-center gap-2 overflow-hidden">
          <div onClick={e => e.stopPropagation()}>
            <Checkbox
              checked={isChecked}
              onCheckedChange={() => onCheck(node.type, itemId)}
              className="h-3.5 w-3.5"
            />
          </div>
          {isFolder && (
            <div
              className={`p-0.5 rounded-sm hover:bg-accent ${hasChildren ? '' : 'invisible'}`}
              onClick={handleToggle}>
              {isOpen ? (
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3 w-3 text-muted-foreground" />
              )}
            </div>
          )}
          {!isFolder && <div className="w-4" />} {/* Indent for notes */}
          {isFolder ? (
            <FolderIcon className="h-4 w-4 text-blue-400 shrink-0" />
          ) : (
            <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
          )}
          <span className="truncate">{isFolder ? node.data.name : node.data.title}</span>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="元に戻す"
            onClick={e => {
              e.stopPropagation();
              onRestore(node.type, itemId);
            }}>
            <RotateCcw className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-destructive hover:text-destructive"
            title="完全に削除"
            onClick={e => {
              e.stopPropagation();
              onDelete(node.type, itemId);
            }}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {isFolder && isOpen && (
        <div>
          {node.children.map(child => (
            <TrashItem
              key={`${child.type}-${child.type === 'folder' ? child.data.id : child.data.id}`}
              node={child}
              depth={depth + 1}
              selectedItems={selectedItems}
              onCheck={onCheck}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function TrashView() {
  const {
    deletedNotes,
    deletedFolders,
    isLoading,
    restoreNote,
    restoreFolder,
    permanentlyDeleteNote,
    permanentlyDeleteFolder,
    emptyTrash,
    restoreAll
  } = useTrashStore();
  const [confirmEmptyTrash, setConfirmEmptyTrash] = useState(false);
  const [confirmDeleteItem, setConfirmDeleteItem] = useState<{
    type: 'note' | 'folder';
    id: number;
  } | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [confirmDeleteSelected, setConfirmDeleteSelected] = useState(false);

  const trashTree = useMemo(
    () => buildTrashTree(deletedNotes, deletedFolders),
    [deletedNotes, deletedFolders]
  );

  const totalItems = deletedNotes.length + deletedFolders.length;
  const selectedCount = selectedItems.size;

  function handleCheck(type: 'note' | 'folder', id: number) {
    const targetNode = findNode(trashTree, type, id);
    if (!targetNode) return;

    const keysToToggle = getAllDescendantKeys(targetNode);
    const newSet = new Set(selectedItems);

    // 親が選択されているかチェック（トグル動作のため）
    const parentKey = `${type}-${id}`;
    const isSelecting = !newSet.has(parentKey);

    for (const key of keysToToggle) {
      if (isSelecting) {
        newSet.add(key);
      } else {
        newSet.delete(key);
      }
    }
    setSelectedItems(newSet);
  }

  function handleClearSelection() {
    setSelectedItems(new Set());
  }

  async function handleRestore(type: 'note' | 'folder', id: number) {
    if (type === 'note') {
      await restoreNote(id);
    } else {
      await restoreFolder(id);
    }
    // 選択状態から削除
    const key = `${type}-${id}`;
    if (selectedItems.has(key)) {
      const newSet = new Set(selectedItems);
      newSet.delete(key);
      setSelectedItems(newSet);
    }
  }

  async function handleRestoreAll() {
    await restoreAll();
    setSelectedItems(new Set());
  }

  async function handleRestoreSelected() {
    const promises: Promise<void>[] = [];
    for (const key of selectedItems) {
      const [type, idStr] = key.split('-');
      const id = Number(idStr);
      if (type === 'note') {
        promises.push(restoreNote(id));
      } else {
        promises.push(restoreFolder(id));
      }
    }
    await Promise.all(promises);
    setSelectedItems(new Set());
  }

  function handleDeleteRequest(type: 'note' | 'folder', id: number) {
    setConfirmDeleteItem({ type, id });
  }

  async function handlePermanentlyDelete() {
    if (!confirmDeleteItem) return;

    if (confirmDeleteItem.type === 'note') {
      await permanentlyDeleteNote(confirmDeleteItem.id);
    } else {
      await permanentlyDeleteFolder(confirmDeleteItem.id);
    }

    // 選択状態から削除
    const key = `${confirmDeleteItem.type}-${confirmDeleteItem.id}`;
    if (selectedItems.has(key)) {
      const newSet = new Set(selectedItems);
      newSet.delete(key);
      setSelectedItems(newSet);
    }

    setConfirmDeleteItem(null);
  }

  async function handleDeleteSelected() {
    const promises: Promise<void>[] = [];
    for (const key of selectedItems) {
      const [type, idStr] = key.split('-');
      const id = Number(idStr);
      if (type === 'note') {
        promises.push(permanentlyDeleteNote(id));
      } else {
        promises.push(permanentlyDeleteFolder(id));
      }
    }
    await Promise.all(promises);
    setSelectedItems(new Set());
    setConfirmDeleteSelected(false);
  }

  async function handleEmptyTrash() {
    await emptyTrash();
    setConfirmEmptyTrash(false);
    setSelectedItems(new Set());
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-4 space-y-3">
        <div>
          <h1 className="text-xl font-bold">ゴミ箱</h1>
          <p className="text-xs text-muted-foreground">
            {selectedCount > 0 ? `${selectedCount}個選択中` : `${totalItems}個のアイテム`}
          </p>
        </div>

        {selectedCount > 0 ? (
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleRestoreSelected}
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs justify-start">
              <RotateCcw className="mr-2 h-3 w-3" />
              選択した項目を元に戻す
            </Button>
            <Button
              onClick={() => setConfirmDeleteSelected(true)}
              size="sm"
              variant="destructive"
              className="w-full h-8 text-xs justify-start">
              <Trash2 className="mr-2 h-3 w-3" />
              選択した項目を削除
            </Button>
            <Button
              onClick={handleClearSelection}
              size="sm"
              variant="ghost"
              className="w-full h-8 text-xs justify-start">
              <X className="mr-2 h-3 w-3" />
              選択解除
            </Button>
          </div>
        ) : (
          totalItems > 0 && (
            <div className="flex flex-col gap-2">
              <Button
                onClick={handleRestoreAll}
                size="sm"
                variant="outline"
                className="w-full h-8 text-xs justify-start">
                <RotateCcw className="mr-2 h-3 w-3" />
                すべて元に戻す
              </Button>
              <Button
                onClick={() => setConfirmEmptyTrash(true)}
                size="sm"
                variant="destructive"
                className="w-full h-8 text-xs justify-start">
                <Trash2 className="mr-2 h-3 w-3" />
                ゴミ箱を空にする
              </Button>
            </div>
          )
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {isLoading && (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground text-sm">読み込み中...</p>
          </div>
        )}
        {!isLoading && totalItems === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <Trash2 className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">ゴミ箱は空です</p>
            </div>
          </div>
        )}
        {!isLoading && totalItems > 0 && (
          <div className="space-y-0.5">
            {trashTree.map(node => (
              <TrashItem
                key={`${node.type}-${node.type === 'folder' ? node.data.id : node.data.id}`}
                node={node}
                selectedItems={selectedItems}
                onCheck={handleCheck}
                onRestore={handleRestore}
                onDelete={handleDeleteRequest}
              />
            ))}
          </div>
        )}
      </div>

      {/* Empty Trash Confirmation Dialog */}
      <AlertDialog
        onOpenChange={setConfirmEmptyTrash}
        open={confirmEmptyTrash}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ゴミ箱を空にしますか?</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。ゴミ箱内のすべてのアイテムが完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleEmptyTrash}>空にする</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Selected Confirmation Dialog */}
      <AlertDialog
        onOpenChange={setConfirmDeleteSelected}
        open={confirmDeleteSelected}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>選択した項目を削除しますか?</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。選択した{selectedCount}個のアイテムが完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent Delete Confirmation Dialog */}
      <AlertDialog
        onOpenChange={() => setConfirmDeleteItem(null)}
        open={confirmDeleteItem !== null}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>完全に削除しますか?</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。このアイテムは完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={handlePermanentlyDelete}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
