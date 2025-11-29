import { Copy, Edit2, FileText, FolderInput, MoreHorizontal, Star, Trash2 } from 'lucide-react';
import React, { useEffect, useState, memo } from 'react';
import { useDraggable } from '@dnd-kit/core';

import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import {
  useCreateNote,
  useDeleteNote,
  useMoveNote,
  useNotes,
  useToggleFavorite
} from '@/hooks/useNote';
import { loadNote as fetchNote } from '@/lib/api/notes';
import { exportNote } from '@/lib/export';
import { cn } from '@/lib/utils';
import { useNoteStore } from '@/stores/notes';
import { useSelectionStore } from '@/stores/selection';
import { type Note } from '@/types/notes';

import { NoteInfoDialog } from './note-item/NoteInfoDialog';
import { NoteItemContextMenu } from './note-item/NoteItemContextMenu';
import { NoteItemDeleteDialog } from './note-item/NoteItemDeleteDialog';
import { NoteItemMoveMenu } from './note-item/NoteItemMoveMenu';

type NoteItemProps = {
  note: Note;
};

export const NoteItem = memo(function NoteItem({ note }: NoteItemProps) {
  const { loadNote } = useNotes();
  const { deleteNote } = useDeleteNote();
  const { moveNote } = useMoveNote();
  const { createNote } = useCreateNote();
  const { toggleFavorite } = useToggleFavorite();
  const updateNote = useNoteStore(state => state.updateNote);

  // Selector to check if this note is the current one
  const isCurrentNote = useNoteStore(state => state.currentNote?.id === note.id);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  // Optimized selection store selectors
  const selectionMode = useSelectionStore(state => state.selectionMode);
  const selected = useSelectionStore(state =>
    state.selectedItems.some(item => item.id === note.id && item.type === 'note')
  );
  const toggleSelection = useSelectionStore(state => state.toggleSelection);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: note.id,
    disabled: isEditing || selectionMode // 選択モード時はドラッグ無効
  });

  useEffect(() => {
    setTitle(note.title);
  }, [note.title]);

  function handleSave() {
    if (title.trim() === '') {
      setIsEditing(false);
      setTitle(note.title);
    } else {
      loadNote(note.id);
      // Use getState to avoid subscribing to content changes
      const content = useNoteStore.getState().currentContent;
      updateNote(note.id, title, content || '');
      setIsEditing(false);
    }
  }

  function confirmDelete() {
    deleteNote(note.id);
    setShowDeleteConfirm(false);
  }

  function handleMoveToFolder(folderId: number | null) {
    moveNote(note.id, folderId);
    setShowMoveMenu(false);
  }

  function handleToggleFavorite(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    toggleFavorite(note.id);
  }

  async function handleDuplicate(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    try {
      // Simple directory extraction
      const separator = note.file_path.includes('\\') ? '\\' : '/';
      const folderPath = note.file_path.slice(0, note.file_path.lastIndexOf(separator));

      let contentToCopy = '';
      const state = useNoteStore.getState();
      if (state.currentNote?.id === note.id && state.currentContent) {
        contentToCopy = state.currentContent;
      } else if (state.currentNote?.id !== note.id) {
        const noteData = await fetchNote(note.id);
        contentToCopy = noteData.content;
      }

      await createNote(`${note.title} (Copy)`, contentToCopy, folderPath, note.parent_id);
      toast.success('Note duplicated');
    } catch {
      toast.error('Failed to duplicate note');
    }
  }

  async function handleExport(format: 'md' | 'html' | 'pdf') {
    try {
      const noteWithContent = await fetchNote(note.id);
      await exportNote(noteWithContent, format);
      toast.success('ノートをエクスポートしました');
    } catch (error) {
      toast.error('エクスポートに失敗しました', {
        description: String(error)
      });
    }
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
        <HoverCard openDelay={200}>
          <NoteItemContextMenu
            onRename={() => setIsEditing(true)}
            onMove={() => setShowMoveMenu(true)}
            onDelete={() => setShowDeleteConfirm(true)}
            onExport={handleExport}
            onInfo={() => setShowInfo(true)}>
            <HoverCardTrigger asChild>
              <div
                ref={setNodeRef}
                {...attributes}
                {...listeners}
                className={cn(
                  'flex items-center gap-2 pl-6 pr-2 py-1.5 rounded text-primary dark:text-white group relative cursor-pointer',
                  isCurrentNote
                    ? 'bg-gray-300/50 dark:bg-gray-600/50'
                    : 'hover:bg-gray-200 dark:hover:bg-gray-700/50',
                  isDragging && 'opacity-50',
                  selected && 'bg-blue-100 dark:bg-blue-900/30'
                )}
                onClick={() => {
                  if (selectionMode) {
                    toggleSelection(note.id, 'note');
                  } else {
                    loadNote(note.id);
                  }
                }}>
                {selectionMode && (
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggleSelection(note.id, 'note')}
                    onClick={e => e.stopPropagation()}
                    className="mr-1"
                  />
                )}
                <FileText className="h-4 w-4 shrink-0" />
                <p className="text-sm font-medium truncate">{note.title}</p>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                        onClick={e => e.stopPropagation()}>
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleToggleFavorite}>
                        <Star
                          className={cn(
                            'mr-2 h-4 w-4',
                            note.isFavorite && 'fill-yellow-400 text-yellow-400'
                          )}
                        />
                        {note.isFavorite ? 'お気に入り解除' : 'お気に入りに追加'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setIsEditing(true)}>
                        <Edit2 className="mr-2 h-4 w-4" />
                        名前を変更
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setShowMoveMenu(true)}>
                        <FolderInput className="mr-2 h-4 w-4" />
                        移動
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={handleDuplicate}>
                        <Copy className="mr-2 h-4 w-4" />
                        複製
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setShowDeleteConfirm(true)}
                        className="text-destructive focus:text-destructive">
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </HoverCardTrigger>
          </NoteItemContextMenu>
          <HoverCardContent
            side="right"
            align="center"
            className="w-60">
            <p className="text-sm text-muted-foreground line-clamp-1">{note.preview}</p>
          </HoverCardContent>
        </HoverCard>
      )}
      {showMoveMenu && <NoteItemMoveMenu onMove={handleMoveToFolder} />}

      <NoteItemDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        noteTitle={note.title}
        onConfirm={confirmDelete}
      />

      <NoteInfoDialog
        noteId={note.id}
        open={showInfo}
        onOpenChange={setShowInfo}
      />
    </div>
  );
});
