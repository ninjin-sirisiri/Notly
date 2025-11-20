import { Edit2, FileText, FolderInput, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useDraggable } from '@dnd-kit/core';

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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@/components/ui/context-menu';
import { useCurrentNote, useDeleteNote, useMoveNote, useNotes } from '@/hooks/useNote';
import { cn } from '@/lib/utils';
import { useFolderStore } from '@/stores/folders';
import { type Note } from '@/types/notes';

type NoteItemProps = {
  note: Note;
};

export function NoteItem({ note }: NoteItemProps) {
  const { loadNote } = useNotes();
  const { currentNote, currentContent, updateNote } = useCurrentNote();
  const { deleteNote } = useDeleteNote();
  const { moveNote } = useMoveNote();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { folders } = useFolderStore();

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: note.id,
    disabled: isEditing
  });

  useEffect(() => {
    setTitle(note.title);
  }, [note]);

  function handleSave() {
    if (title.trim() === '') {
      setIsEditing(false);
      setTitle('');
    } else {
      loadNote(note.id);
      const content = currentContent;
      updateNote(note.id, title, content || '');
      setIsEditing(false);
      setTitle('');
    }
  }

  function handleDelete(e: React.MouseEvent<HTMLButtonElement>) {
    e.stopPropagation();
    setShowDeleteConfirm(true);
  }

  function confirmDelete() {
    deleteNote(note.id);
    setShowDeleteConfirm(false);
  }

  function handleMoveToFolder(folderId: number | null) {
    moveNote(note.id, folderId);
    setShowMoveMenu(false);
  }

  return (
    <div className="relative">
      {isEditing ? (
        <div className="flex items-center gap-2 pl-6 pr-2 py-1.5 rounded text-primary dark:text-white group relative">
          <input
            autoFocus
            value={title}
            onBlur={() => setIsEditing(false)}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
          />
        </div>
      ) : (
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <div
              ref={setNodeRef}
              {...attributes}
              {...listeners}
              className={cn(
                'flex items-center gap-2 pl-6 pr-2 py-1.5 rounded text-primary dark:text-white group relative',
                currentNote?.id === note.id
                  ? 'bg-gray-300/50 dark:bg-gray-600/50'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700/50',
                isDragging && 'opacity-50'
              )}
              onClick={() => {
                loadNote(note.id);
              }}>
              <FileText className="h-4 w-4" />
              <p className="text-sm font-medium truncate">{note.title}</p>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  title="名前を変更"
                  onClick={e => {
                    e.stopPropagation();
                    setIsEditing(true);
                  }}>
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
                <button
                  className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  title="移動"
                  onClick={e => {
                    e.stopPropagation();
                    setShowMoveMenu(true);
                  }}>
                  <FolderInput className="h-3.5 w-3.5" />
                </button>
                <button
                  className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                  title="削除"
                  onClick={handleDelete}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem
              onClick={() => {
                setIsEditing(true);
              }}>
              <Edit2 className="mr-2 h-4 w-4" />
              名前を変更
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                setShowMoveMenu(true);
              }}>
              <FolderInput className="mr-2 h-4 w-4" />
              移動
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 focus:text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              削除
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>
      )}
      {showMoveMenu && (
        <div className="absolute z-10 right-0 top-full mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg max-h-64 overflow-y-auto">
          <button
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={e => {
              e.stopPropagation();
              handleMoveToFolder(null);
            }}>
            📁 ルート
          </button>
          {(() => {
            // Build folder tree
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
                onClick={e => {
                  e.stopPropagation();
                  handleMoveToFolder(folder.id);
                }}>
                <span className="text-xs opacity-50">{'└─'.repeat(Math.min(depth, 1))}</span>📁{' '}
                {folder.name}
              </button>
            ));
          })()}
        </div>
      )}

      <AlertDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>ノートを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              「{note.title}」を削除します。この操作は取り消せません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>削除</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
