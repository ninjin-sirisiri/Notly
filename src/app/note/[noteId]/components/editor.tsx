"use client";

import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotes } from "@/hooks/useNotes";

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
      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">エディタ</TabsTrigger>
          <TabsTrigger value="preview">プレビュー</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <textarea
            className="w-full h-[calc(100vh-222px)] text-2xl"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => updateNote(noteId, title, content)}
          />
        </TabsContent>
        <TabsContent value="preview" className="prose">
          <Markdown remarkPlugins={[remarkGfm]}>{content}</Markdown>
        </TabsContent>
      </Tabs>
    </div>
  );
}
