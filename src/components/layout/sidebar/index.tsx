import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { Input } from '@/components/ui/input';
import { useFiles } from '@/hooks/useFiles';
import { useCreateFolder } from '@/hooks/useFolder';
import { useCreateNote } from '@/hooks/useNote';
import { useFolderStore } from '@/stores/folders';
import { useNoteStore } from '@/stores/notes';

import { CreateFolderButton } from './CreateFolderButton';
import { CreateNoteButton } from './CreateNoteButton';
import { FileItem } from './FileItem';
import { FileSearch } from './FileSearch';

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { files } = useFiles();
  const allNotes = useNoteStore(state => state.notes);
  const { currentFolder } = useFolderStore();
  const { createNote, isLoading: isNoteCreating } = useCreateNote();
  const { createFolder, isLoading: isFolderCreating } = useCreateFolder();
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [title, setTitle] = useState('');
  const [folderName, setFolderName] = useState('');
  const noteInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

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
        <div className="flex flex-col gap-4">
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
          <div className="overflow-y-auto">
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
        </div>
      </aside>
    </>
  );
}
