"use client";

import { DeleteIcon } from "@/components/icon/delete-icon";
import { Button } from "@/components/ui/button";
import { useNotes } from "@/hooks/useNotes";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export function FolderTree() {
  const { notes, createNote, deleteNote } = useNotes();
  const { noteId } = useParams<{ noteId: string }>();
  const router = useRouter();

  return (
    <div className="bg-gray-100 w-2xs">
      <Button onClick={() => createNote("新しいノート", "")}>
        ノートを作成
      </Button>
      <ul>
        {notes.map((note) => (
          <li key={note.id} className="flex items-center justify-between">
            <Button variant="ghost">
              <Link href={`/note/${note.id}`}>{note.title}</Link>
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                deleteNote(note.id);
                if (noteId === note.id) router.push("/");
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
