"use client";

import { useEffect, useState } from "react";

import { Separator } from "@/components/ui/separator";
import { useNotes } from "@/hooks/useNotes";
import { Button } from "@/components/ui/button";

export function Editor({ noteId }: { noteId: string }) {
  const { notes, updateNote } = useNotes();
  const note = notes.find((note) => note.id === noteId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  useEffect(() => {
    if (note) {
      setTitle(note.title ?? "");
      setContent(note.content ?? "");
    }
  }, [note]);

  return (
    <div className="w-[calc(100vw-288px)]">
      <div className="flex items-center justify-between h-12 text-center text-gray-400 p-3">
        <div>{note?.createdAt.toLocaleDateString()}</div>
        <Button onClick={() => updateNote(noteId, title, content)}>保存</Button>
      </div>
      <Separator />
      <input
        className="h-12 text-center font-bold text-3xl p-1 w-full "
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => updateNote(noteId, title, content)}
      />
      <Separator />
      <textarea
        className="w-full h-[calc(100vh-176px)] text-2xl"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
    </div>
  );
}
