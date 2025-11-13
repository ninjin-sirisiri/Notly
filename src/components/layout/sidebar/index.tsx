import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragEndEvent
} from '@dnd-kit/core';

import { Input } from '@/components/ui/input';
import { useFiles } from '@/hooks/useFiles';
import { useCreateFolder, useMoveFolder } from '@/hooks/useFolder';
import { useCreateNote, useMoveNote } from '@/hooks/useNote';
import { cn } from '@/lib/utils';
import { useFolderStore } from '@/stores/folders';
import { useNoteStore } from '@/stores/notes';

import { CreateFolderButton } from './CreateFolderButton';
import { CreateNoteButton } from './CreateNoteButton';
import { FileItem } from './FileItem';
import { FileSearch } from './FileSearch';

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
  const { currentFolder } = useFolderStore();
  const { createNote, isLoading: isNoteCreating } = useCreateNote();
  const { createFolder, isLoading: isFolderCreating } = useCreateFolder();
  const { moveNote } = useMoveNote();
  const { moveFolder } = useMoveFolder();
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [title, setTitle] = useState('');
  const [folderName, setFolderName] = useState('');
  const noteInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

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
        const untitledNotes = allNotes.filter(note => note.title.startsWith('Untitled'));
        newTitle = untitledNotes.length > 0 ? `Untitled ${untitledNotes.length + 1}` : 'Untitled';
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
      const newFolderName = folderName.trim() || 'Untitled Folder';
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
          <FileSearch />
          <div className="px-2 flex items-center justify-between gap-2">
            <CreateNoteButton
              onClick={() => setIsCreatingNote(true)}
              disabled={isNoteCreating || isCreatingNote}
            />
            <CreateFolderButton
              onClick={() => setIsCreatingFolder(true)}
              disabled={isFolderCreating || isCreatingFolder}
            />
          </div>
          <div className="h-full">
            <DndContext
              sensors={sensors}
              onDragEnd={handleDragEnd}>
              <RootDroppable>
                <div className="overflow-y-auto h-full">
                  {isCreatingNote && (
                    <div className="px-2 py-1">
                      <Input
                        ref={noteInputRef}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        onKeyDown={handleNoteKeyDown}
                        onBlur={handleNoteBlur}
                        placeholder="Note title..."
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
                        placeholder="Folder name..."
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
