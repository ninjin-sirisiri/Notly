import { useCurrentNote, useDeleteNote, useNotes } from '@/hooks/useNote';
import { cn } from '@/lib/utils';
import { Note } from '@/types/notes';
import { FileText, Edit2, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

type NoteItemProps = {
  note: Note;
};

export function NoteItem({ note }: NoteItemProps) {
  const { loadNote } = useNotes();
  const { currentNote, currentContent, updateNote } = useCurrentNote();
  const { deleteNote } = useDeleteNote();

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);

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
    deleteNote(note.id);
  }

  return (
    <>
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
        <div
          className={cn(
            'flex items-center gap-2 pl-6 pr-2 py-1.5 rounded text-primary dark:text-white group relative',
            currentNote?.id === note.id
              ? 'bg-gray-300/50 dark:bg-gray-600/50'
              : 'hover:bg-gray-200 dark:hover:bg-gray-700/50'
          )}
          onClick={() => {
            loadNote(note.id);
          }}
        >
          <FileText className="h-4 w-4" />
          <p className="text-sm font-medium truncate">{note.title}</p>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              title="名前を変更"
              onClick={e => {
                e.stopPropagation();
                setIsEditing(true);
              }}
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              title="削除"
              onClick={handleDelete}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
