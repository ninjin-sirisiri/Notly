import { CheckSquare, CheckCheck, FolderInput, Trash2, X } from 'lucide-react';
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

import { CreateFolderButton } from './CreateFolderButton';
import { CreateNoteButton } from './CreateNoteButton';
import { FileItem } from './FileItem';
import { FileSearch } from './FileSearch';
import { SortMenu } from './SortMenu';

function RootDroppable({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: 'root'
  });

  return (
    <div
      ref={setNodeRef}
      className={cn('overflow-y-auto h-full', isOver && 'bg-blue-50 dark:bg-blue-950/20')}>
      {children}
    </div>
  );
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { files } = useFiles();
  const allNotes = useNoteStore(state => state.notes);
  const { currentFolder, folders } = useFolderStore();
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

  const [showBulkMoveMenu, setShowBulkMoveMenu] = useState(false);

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
      setShowBulkMoveMenu(false);
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
        border-r border-[#EAEAEA] dark:border-[#333333]
        bg-white dark:bg-[#1A1A1A]
        p-2 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <FileSearch />
            <SortMenu />
          </div>
          <div className="px-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {!selectionMode && (
                <>
                  <CreateNoteButton
                    onClick={() => setIsCreatingNote(true)}
                    disabled={isNoteCreating || isCreatingNote}
                  />
                  <CreateFolderButton
                    onClick={() => setIsCreatingFolder(true)}
                    disabled={isFolderCreating || isCreatingFolder}
                  />
                </>
              )}
              {selectionMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSelectAll}
                  title="全選択">
                  <CheckCheck className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSelectionMode}
                title={selectionMode ? '選択モードを終了' : '選択モード'}>
                <CheckSquare className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* 一括操作メニュー */}
          {selectionMode && selectedItems.length > 0 && (
            <div className="px-2 py-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {selectedItems.length}個選択中
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  className="h-6 px-2">
                  <X className="h-3 w-3 mr-1" />
                  解除
                </Button>
              </div>
              <div className="flex gap-2 relative">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleBulkDelete}
                  className="flex-1 h-8">
                  <Trash2 className="h-3 w-3 mr-1" />
                  削除
                </Button>
                <div className="relative flex-1">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowBulkMoveMenu(!showBulkMoveMenu)}
                    className="w-full h-8">
                    <FolderInput className="h-3 w-3 mr-1" />
                    移動
                  </Button>
                  {showBulkMoveMenu && (
                    <div className="absolute z-10 left-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg max-h-64 overflow-y-auto">
                      <button
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => handleBulkMove(null)}>
                        📁 ルート
                      </button>
                      {(() => {
                        function buildTree(
                          parentId: number | null
                        ): { folder: (typeof folders)[0]; depth: number }[] {
                          const result: { folder: (typeof folders)[0]; depth: number }[] = [];
                          const children = folders.filter(f => f.parentId === parentId);

                          for (const child of children) {
                            result.push({ folder: child, depth: 0 });
                            const subChildren = buildTree(child.id);
                            result.push(...subChildren.map(sc => ({ ...sc, depth: sc.depth + 1 })));
                          }

                          return result;
                        }

                        const tree = buildTree(null);

                        return tree.map(({ folder, depth }) => (
                          <button
                            key={folder.id}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-1"
                            style={{ paddingLeft: `${12 + depth * 16}px` }}
                            onClick={() => handleBulkMove(folder.id)}>
                            <span className="text-xs opacity-50">
                              {'└─'.repeat(Math.min(depth, 1))}
                            </span>
                            📁 {folder.name}
                          </button>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

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
                      key={'folder' in item ? `folder-${item.folder.id}` : `note-${item.note.id}`}
                      item={item}
                    />
                  ))}
                </div>
              </RootDroppable>
            </DndContext>
          </div>
        </div>
      </aside>
    </>
  );
}
