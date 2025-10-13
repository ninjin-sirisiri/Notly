import { Notebook, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { NoteItemProps } from './types';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function NoteItem({ note, isSelected, level, onDeleteNote }: NoteItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const paddingLeft = `${level * 16}px`;

  return (
    <div
      className={`flex items-center justify-between hover:bg-gray-200 rounded px-2 py-1 ${
        isSelected ? 'bg-blue-100' : ''
      }`}
      style={{ paddingLeft }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={`/note/${note.id}`} className="flex items-center gap-2 flex-1 text-sm">
        <Notebook className="h-3 w-3 text-gray-500" />
        {note.title || 'Untitled'}
      </Link>
      {isHovered && (
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={(e) => {
            e.stopPropagation();
            onDeleteNote(note.id);
          }}
          title="Delete folder"
        >
          <Trash2 className="h-3 w-3 text-red-500" />
        </Button>
      )}
    </div>
  );
}
