import { Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';

import { useTrashStore } from '@/stores/trash';

import { TrashDialogs } from './TrashDialogs';
import { TrashHeader } from './TrashHeader';
import { TrashItem } from './TrashItem';
import { buildTrashTree, findNode, getAllDescendantKeys } from './utils';

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
      <TrashHeader
        selectedCount={selectedCount}
        totalItems={totalItems}
        onRestoreSelected={handleRestoreSelected}
        onDeleteSelected={() => setConfirmDeleteSelected(true)}
        onClearSelection={handleClearSelection}
        onRestoreAll={handleRestoreAll}
        onEmptyTrash={() => setConfirmEmptyTrash(true)}
      />

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

      <TrashDialogs
        confirmEmptyTrash={confirmEmptyTrash}
        setConfirmEmptyTrash={setConfirmEmptyTrash}
        handleEmptyTrash={handleEmptyTrash}
        confirmDeleteSelected={confirmDeleteSelected}
        setConfirmDeleteSelected={setConfirmDeleteSelected}
        selectedCount={selectedCount}
        handleDeleteSelected={handleDeleteSelected}
        confirmDeleteItem={confirmDeleteItem}
        setConfirmDeleteItem={setConfirmDeleteItem}
        handlePermanentlyDelete={handlePermanentlyDelete}
      />
    </div>
  );
}
