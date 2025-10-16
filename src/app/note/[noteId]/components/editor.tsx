'use client';

import { useEffect, useState } from 'react';
import Markdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';
import remarkBreaks from 'remark-breaks';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation'; // useRouterをインポート

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNotes } from '@/hooks/useNotes';

import MarkdownEditor from './markdown-editor';
// FolderSelectorDialogをインポート
import { FolderSelectorDialog } from './folder-selector-dialog';

export function Editor({ noteId }: { noteId: string | undefined }) {
  const { notes, updateNote, createNote, selectedFolderId } = useNotes();
  const router = useRouter(); // useRouterを初期化
  const note = notes.find((note) => note.id === noteId);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // フォルダ選択ダイアログの状態
  const [isFolderSelectorOpen, setIsFolderSelectorOpen] = useState(false);

  useEffect(() => {
    if (noteId && note) {
      setTitle(note.title ?? '');
      setContent(note.content ?? '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [noteId, note]);

  const handleSave = async () => {
    // 新規ノートの場合のみフォルダ選択ダイアログを開く
    if (!noteId) {
      setIsFolderSelectorOpen(true);
    } else {
      // 既存ノートの場合は明示的な保存ボタンクリック時にもupdateNoteを呼び出す
      await updateNote(noteId, title, content);
    }
  };

  const handleFolderSelectAndCreateNote = async (folderId: string | undefined) => {
    const newNote = await createNote(title, content, folderId);
    router.push(`/note/${newNote.note.id}`);
    setIsFolderSelectorOpen(false); // ダイアログを閉じる
  };
  return (
    <div className="w-[calc(100vw-252px)] bg-background">
      <div className="flex items-center justify-between h-12 text-center text-muted-foreground p-3">
        <div>{note?.createdAt.toLocaleDateString()}</div>
        <Button onClick={handleSave}>保存</Button>
      </div>
      <Separator />
      <input
        className="h-12 text-center font-bold text-3xl p-1 w-full bg-transparent focus:outline-none"
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => noteId && updateNote(noteId, title, content)} // 既存ノートのみ自動保存
      />
      <Separator />
      <Tabs defaultValue="editor">
        <TabsList>
          <TabsTrigger value="editor">エディタ</TabsTrigger>
          <TabsTrigger value="preview">プレビュー</TabsTrigger>
        </TabsList>
        <TabsContent value="editor">
          <MarkdownEditor
            content={content}
            setContent={setContent}
            onBlur={() => noteId && updateNote(noteId, title, content)} // 既存ノートのみ自動保存
          />
        </TabsContent>
        <TabsContent value="preview" className="prose dark:prose-invert">
          <ScrollArea className="h-[calc(100vh-222px)] w-[calc(100vw-288px)] p-0.5">
            <Markdown
              remarkPlugins={[remarkGfm, remarkBreaks]}
              components={{
                code(props) {
                  const { children, className } = props;
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <SyntaxHighlighter language={match[1]}>{children as string}</SyntaxHighlighter>
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

      {/* フォルダ選択ダイアログ */}
      <FolderSelectorDialog
        isOpen={isFolderSelectorOpen}
        onClose={() => setIsFolderSelectorOpen(false)}
        onSelectFolder={handleFolderSelectAndCreateNote}
        currentSelectedFolderId={selectedFolderId}
      />
    </div>
  );
}
