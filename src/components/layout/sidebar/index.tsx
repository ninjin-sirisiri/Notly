import { NoteItem } from '../sidebar/NoteItem';
import { CreateFolderButton } from './CreateFolderButton';
import { CreateNoteButton } from './CreateNoteButton';
import { FileSearch } from './FileSearch';
import { useNotes } from '@/hooks/useNote';

export function Sidebar({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { notes } = useNotes();

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
            <CreateNoteButton />
            <CreateFolderButton />
          </div>
          <div className="overflow-y-auto">
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
