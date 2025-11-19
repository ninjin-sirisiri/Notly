import { useEffect, useState } from 'react';

import { useCurrentNote } from '@/hooks/useNote';
import { useNoteStore } from '@/stores/notes';

import { EditorHeader } from './EditorHeader';
import { FolderSelectDialog } from './FolderSelectDialog';
import { MarkdownEditor } from './MarkdownEditor';

export function Editor() {
  const { currentNote, currentContent, updateNote, isLoading } = useCurrentNote();
  const createNote = useNoteStore(state => state.createNote);

  const [title, setTitle] = useState(currentNote?.title || '');
  const [content, setContent] = useState(currentContent || '');
  const [showFolderDialog, setShowFolderDialog] = useState(false);

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentContent || '');
    } else {
      setTitle('');
      setContent('');
    }
  }, [currentNote, currentContent]);

  function handleSave() {
    // 既存のノートを更新
    if (currentNote?.id) {
      updateNote(currentNote.id, title, content);
      return;
    }

    // 新規ノートの場合：フォルダ選択ダイアログを表示
    setShowFolderDialog(true);
  }

  async function handleFolderSelect(folderId: number | null, folderPath: string) {
    try {
      await createNote(title || '無題のノート', content, folderPath, folderId);
    } catch {
      // エラーハンドリング: ユーザーには別途通知する可能性があるが、ここではスキップ
    }
  }

  return (
    <>
      <main className="flex-1 flex flex-col p-3 md:p-6">
        <EditorHeader
          title={title}
          setTitle={setTitle}
          handleSave={handleSave}
          created_at={currentNote?.created_at || new Date()}
          isLoading={isLoading}
          isNewNote={!currentNote}
        />
        <MarkdownEditor
          content={content}
          setContent={setContent}
          handleSave={handleSave}
          isNewNote={!currentNote}
        />
      </main>
      <FolderSelectDialog
        open={showFolderDialog}
        onOpenChange={setShowFolderDialog}
        onSelectFolder={handleFolderSelect}
      />
    </>
  );
}
