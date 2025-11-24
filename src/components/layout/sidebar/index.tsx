import { useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent
} from '@dnd-kit/core';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFiles } from '@/hooks/useFiles';
import {
  useCreateFolder,
  useCurrentFolder,
  useMoveFolder,
  useDeleteFolder
} from '@/hooks/useFolder';
import { useCreateNote, useMoveNote, useDeleteNote } from '@/hooks/useNote';
import { cn } from '@/lib/utils';
import { useFolderStore } from '@/stores/folders';
import { useNoteStore } from '@/stores/notes';
import { useSelectionStore } from '@/stores/selection';

import { BulkActions } from './actions/BulkActions';
import { SidebarHeader } from './header/SidebarHeader';
import { TagList } from './TagList';
import { TrashView } from './trash';
import { FileItem } from './tree/FileItem';

function RootDroppable({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'root'
  });

  return (
    <div
      ref={setNodeRef}
      className={cn('overflow-y-auto h-full', isOver && 'bg-accent/50')}>
      {children}
    </div>
  );
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { files } = useFiles();
  const allNotes = useNoteStore(state => state.notes);
  const { currentFolder } = useFolderStore();
  const { createNote, isLoading: isNoteCreating } = useCreateNote();
  const { createFolder, isLoading: isFolderCreating } = useCreateFolder();
  const { moveNote } = useMoveNote();
  const { moveFolder } = useMoveFolder();
  const { deleteNote } = useDeleteNote();
  const { deleteFolder } = useDeleteFolder();
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [title, setTitle] = useState('');
  const [folderName, setFolderName] = useState('');
  const noteInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);
  const { setCurrentFolder } = useCurrentFolder();
  const [showTrash, setShowTrash] = useState(false);

  const [showTags, setShowTags] = useState(false);

  const {
    selectionMode,
    toggleSelectionMode,
    selectedItems,
    clearSelection,
    getSelectedByType,
    selectAll
  } = useSelectionStore();

  useHotkeys(
    'ctrl+n, cmd+n',
    e => {
      e.preventDefault();
      setIsCreatingNote(true);
    },
    { enableOnFormTags: true }
  );

  useHotkeys(
    'ctrl+shift+n, cmd+shift+n',
    e => {
      e.preventDefault();
      setIsCreatingFolder(true);
    },
    { enableOnFormTags: true }
  );

  useHotkeys(
    'delete',
    () => {
      if (selectedItems.length > 0) {
        // Don't prevent default if we are in an input/textarea (handled by enableOnFormTags: false by default)
        // But if we are NOT in an input, we might want to prevent default if it does something else (like nav back)
        handleBulkDelete();
      }
    }
    // Default enableOnFormTags is false, which is what we want for Delete
  );

  useHotkeys(
    'ctrl+d, cmd+d',
    async e => {
      e.preventDefault();
      const { currentNote, currentContent } = useNoteStore.getState();
      if (currentNote && currentContent !== null) {
        try {
          // Simple directory extraction
          const separator = currentNote.file_path.includes('\\') ? '\\' : '/';
          const folderPath = currentNote.file_path.slice(
            0,
            currentNote.file_path.lastIndexOf(separator)
          );

          await createNote(
            `${currentNote.title} (Copy)`,
            currentContent,
            folderPath,
            currentNote.parent_id
          );
          toast.success('Note duplicated');
        } catch {
          toast.error('Failed to duplicate note');
        }
      }
    },
    { enableOnFormTags: true }
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8
      }
    })
  );

  useEffect(() => {
    if (isCreatingNote && noteInputRef.current) {
      noteInputRef.current.focus();
    }
  }, [isCreatingNote]);

  useEffect(() => {
    if (isCreatingFolder && folderInputRef.current) {
      folderInputRef.current.focus();
    }
  }, [isCreatingFolder]);

  async function handleCreateNote() {
    if (!isCreatingNote) return;
    try {
      let newTitle = title.trim();
      if (!newTitle) {
        const untitledNotes = allNotes.filter(note => note.title.startsWith('無題'));
        newTitle = untitledNotes.length > 0 ? `無題 ${untitledNotes.length + 1}` : '無題';
      }
      await createNote(newTitle, '', currentFolder?.folderPath ?? '', currentFolder?.id ?? null);
    } catch (error) {
      toast.error('Failed to create note:', {
        description: error as string
      });
    } finally {
      setIsCreatingNote(false);
      setTitle('');
    }
  }

  async function handleCreateFolder() {
    if (!isCreatingFolder) return;
    try {
      const newFolderName = folderName.trim() || '新しいフォルダ';
      await createFolder(newFolderName, currentFolder?.folderPath ?? '', currentFolder?.id ?? null);
    } catch (error) {
      toast.error('Failed to create folder:', {
        description: error as string
      });
    } finally {
      setIsCreatingFolder(false);
      setFolderName('');
    }
  }

  function handleNoteKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateNote();
    } else if (e.key === 'Escape') {
      setIsCreatingNote(false);
      setTitle('');
    }
  }

  function handleFolderKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateFolder();
    } else if (e.key === 'Escape') {
      setIsCreatingFolder(false);
      setFolderName('');
    }
  }

  function handleNoteBlur() {
    handleCreateNote();
  }

  function handleFolderBlur() {
    handleCreateFolder();
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeId = active.id;
    const targetId = over.id;

    if (typeof activeId === 'string' && activeId.startsWith('folder-')) {
      const folderId = Number(activeId.replace('folder-', ''));

      if (targetId === 'root') {
        await moveFolder(folderId, null);
      } else if (typeof targetId === 'number') {
        await moveFolder(folderId, targetId);
      }
    } else if (typeof activeId === 'number') {
      const noteId = activeId;

      if (targetId === 'root') {
        await moveNote(noteId, null);
      } else if (typeof targetId === 'number') {
        await moveNote(noteId, targetId);
      }
    }
  }

  async function handleBulkDelete() {
    if (selectedItems.length === 0) return;

    const noteIds = getSelectedByType('note');
    const folderIds = getSelectedByType('folder');

    try {
      // 一括削除処理（ノートとフォルダ）
      await Promise.all([
        ...noteIds.map(id => deleteNote(id)),
        ...folderIds.map(id => deleteFolder(id))
      ]);
      toast.success(`${selectedItems.length}個のアイテムを削除しました`);
      clearSelection();
    } catch (error) {
      toast.error('削除に失敗しました', {
        description: error as string
      });
    }
  }

  async function handleBulkMove(targetFolderId: number | null) {
    if (selectedItems.length === 0) return;

    const noteIds = getSelectedByType('note');
    const folderIds = getSelectedByType('folder');

    try {
      await Promise.all([
        ...noteIds.map(id => moveNote(id, targetFolderId)),
        ...folderIds.map(id => moveFolder(id, targetFolderId))
      ]);
      toast.success(`${selectedItems.length}個のアイテムを移動しました`);
      clearSelection();
    } catch (error) {
      toast.error('移動に失敗しました', {
        description: error as string
      });
    }
  }

  function handleSelectAll() {
    // filesから全てのノートとフォルダを再帰的に取得
    const allItems: { id: number; type: 'note' | 'folder' }[] = [];

    function collectItems(items: typeof files) {
      for (const item of items) {
        if ('folder' in item) {
          allItems.push({ id: item.folder.id, type: 'folder' });
          if (item.folder.children) {
            collectItems(item.folder.children);
          }
        } else if ('note' in item) {
          allItems.push({ id: item.note.id, type: 'note' });
        }
      }
    }

    collectItems(files);
    selectAll(allItems);
  }

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-64 md:w-64 shrink-0
        border-r border-border
        bg-sidebar
        p-2 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col gap-4">
          <SidebarHeader
            selectionMode={selectionMode}
            toggleSelectionMode={toggleSelectionMode}
            handleSelectAll={handleSelectAll}
            isNoteCreating={isNoteCreating}
            isCreatingNote={isCreatingNote}
            setIsCreatingNote={setIsCreatingNote}
            isFolderCreating={isFolderCreating}
            isCreatingFolder={isCreatingFolder}
            setIsCreatingFolder={setIsCreatingFolder}
            showTrash={showTrash}
            setShowTrash={setShowTrash}
            showTags={showTags}
            setShowTags={setShowTags}
          />

          {/* 一括操作メニュー */}
          {selectionMode && selectedItems.length > 0 && (
            <BulkActions
              selectedCount={selectedItems.length}
              onClearSelection={clearSelection}
              onDelete={handleBulkDelete}
              onMove={handleBulkMove}
            />
          )}

          {showTrash ? (
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="px-2 mb-2">
                <Button
                  className="w-full justify-start gap-2"
                  onClick={() => setShowTrash(false)}
                  size="sm"
                  variant="ghost">
                  ← ファイル一覧に戻る
                </Button>
              </div>
              <div className="flex-1 overflow-hidden">
                <TrashView />
              </div>
            </div>
          ) : (
            <>
              {showTags && <TagList />}
              <div className="h-full">
                <DndContext
                  sensors={sensors}
                  onDragEnd={handleDragEnd}>
                  <RootDroppable>
                    <div
                      className="overflow-y-auto h-full"
                      onClick={() => setCurrentFolder(null)}>
                      {isCreatingNote && (
                        <div className="px-2 py-1">
                          <Input
                            ref={noteInputRef}
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            onKeyDown={handleNoteKeyDown}
                            onBlur={handleNoteBlur}
                            placeholder="ノートのタイトル..."
                            disabled={isNoteCreating}
                            className="h-8"
                          />
                        </div>
                      )}
                      {isCreatingFolder && (
                        <div className="px-2 py-1">
                          <Input
                            ref={folderInputRef}
                            value={folderName}
                            onChange={e => setFolderName(e.target.value)}
                            onKeyDown={handleFolderKeyDown}
                            onBlur={handleFolderBlur}
                            placeholder="フォルダ名..."
                            disabled={isFolderCreating}
                            className="h-8"
                          />
                        </div>
                      )}
                      {files.map(item => (
                        <FileItem
                          key={
                            'folder' in item ? `folder-${item.folder.id}` : `note-${item.note.id}`
                          }
                          item={item}
                        />
                      ))}
                    </div>
                  </RootDroppable>
                </DndContext>
              </div>
            </>
          )}
        </div>
      </aside>
    </>
  );
}
