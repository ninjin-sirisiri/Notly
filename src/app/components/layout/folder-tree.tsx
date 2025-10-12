'use client';

import { DeleteIcon } from '@/components/icon/delete-icon';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/hooks/useNotes';
import { Notebook } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export function FolderTree() {
  const { notes, createNote, deleteNote } = useNotes();
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');

  const { noteId } = useParams<{ noteId: string }>();
  const router = useRouter();

  const handleCreateNote = async () => {
    if (newNoteTitle.trim() === '') return;
    const { note } = await createNote(newNoteTitle, '');
    router.push(`/note/${note.id}`);
    setIsCreatingNote(false);
    setNewNoteTitle('');
  };

  return (
    <div className="bg-gray-100 w-2xs">
      <div>
        <Button variant="ghost" onClick={() => setIsCreatingNote(true)}>
          <Notebook />
        </Button>
      </div>
      <ul>
        {isCreatingNote && (
          <li>
            <input
              type="text"
              value={newNoteTitle}
              onChange={(e) => setNewNoteTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreateNote();
                }
                if (e.key === 'Escape') {
                  setIsCreatingNote(false);
                  setNewNoteTitle('');
                }
              }}
              onBlur={() => {
                setIsCreatingNote(false);
                setNewNoteTitle('');
              }}
              autoFocus
              className="w-full"
            />
          </li>
        )}
        {notes.map((note) => (
          <li key={note.id} className="flex items-center justify-between">
            <Button variant="ghost">
              <Link href={`/note/${note.id}`}>{note.title}</Link>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                deleteNote(note.id);
                if (noteId === note.id) router.push('/');
              }}
            >
              <DeleteIcon />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
