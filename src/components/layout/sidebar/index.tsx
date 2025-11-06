import { NoteItem } from '../sidebar/NoteItem';
import { CreateFolderButton } from './CreateFolderButton';
import { CreateNoteButton } from './CreateNoteButton';
import { FileSearch } from './FileSearch';
import { Input } from '@/components/ui/input';
import { useNotes, useCreateNote } from '@/hooks/useNote';
import { useNoteStore } from '@/stores/notes';
import { useState, useRef, useEffect } from 'react';

export function Sidebar({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { notes } = useNotes();
  const allNotes = useNoteStore(state => state.notes);
  const { createNote, isLoading } = useCreateNote();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCreating && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isCreating]);

  const handleCreate = async () => {
    if (!isCreating) return;
    try {
      let newTitle = title.trim();
      if (!newTitle) {
        const untitledNotes = allNotes.filter(note =>
          note.title.startsWith('Untitled')
        );
        newTitle =
          untitledNotes.length > 0
            ? `Untitled ${untitledNotes.length + 1}`
            : 'Untitled';
      }
      await createNote(newTitle, '', '');
    } catch (error) {
      console.error('Failed to create note:', error);
    } finally {
      setIsCreating(false);
      setTitle('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreate();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setTitle('');
    }
  };

  const handleBlur = () => {
    handleCreate();
  };

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
      `}
      >
        <div className="flex flex-col gap-4">
          <FileSearch />
          <div className="px-2 flex items-center justify-between gap-2">
            <CreateNoteButton
              onClick={() => setIsCreating(true)}
              disabled={isLoading || isCreating}
            />
            <CreateFolderButton />
          </div>
          <div className="overflow-y-auto">
            {isCreating && (
              <div className="px-2 py-1">
                <Input
                  ref={inputRef}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleBlur}
                  placeholder="Note title..."
                  disabled={isLoading}
                  className="h-8"
                />
              </div>
            )}
            {notes.map(note => (
              <NoteItem
                key={note.id}
                note={note}
              />
            ))}
          </div>
        </div>
      </aside>
    </>
  );
}
