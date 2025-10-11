"use client";

import { useEffect, useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNotes } from "@/hooks/useNotes";
import SyntaxHighlighter from "react-syntax-highlighter";
import remarkBreaks from "remark-breaks";
import { ScrollArea } from "@/components/ui/scroll-area";

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
            className="w-full min-h-[calc(100vh-222px)] max-h-[calc(100vh-222px)] text-2xl"
            spellCheck={false}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onBlur={() => updateNote(noteId, title, content)}
          />
        </TabsContent>
        <TabsContent value="preview" className="prose">
          <ScrollArea className="h-[calc(100vh-222px)] w-[calc(100vw-288px)]">
            <Markdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                code(props) {
                  const { children, className } = props;
                  const match = /language-(\w+)/.exec(className || "");
                  return match ? (
                    <SyntaxHighlighter language={match[1]}>
                      {children as string}
                    </SyntaxHighlighter>
                  ) : (
                    <code className={className}>{children}</code>
                  );
                },
              }}
            >
              {content}
            </Markdown>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
