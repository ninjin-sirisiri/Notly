import { useEffect, useState, useRef } from 'react';

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
  const previousNoteIdRef = useRef<number | undefined>(currentNote?.id);
  const previousContentRef = useRef<string | null>(currentContent);

  // ノートまたはコンテンツが変わったときの処理
  useEffect(() => {
    const currentNoteId = currentNote?.id;
    const isNoteChanged = previousNoteIdRef.current !== currentNoteId;
    const isContentChanged = previousContentRef.current !== currentContent;

    if (isNoteChanged) {
      // ノートが変わった場合
      previousNoteIdRef.current = currentNoteId;
      previousContentRef.current = currentContent;

      if (currentNote) {
        setTitle(currentNote.title);
        // 即座にエディタをクリア
        setContent('');

        // 次のフレームで新しいコンテンツを設定
        setTimeout(() => {
          const latestContent = useNoteStore.getState().currentContent;
          setContent(latestContent || '');
        }, 0);
      } else {
        setTitle('');
        setContent('');
      }
    } else if (isContentChanged) {
      // ノートは同じだが、コンテンツが外部から更新された場合
      previousContentRef.current = currentContent;
      if (currentNote) {
        setTitle(currentNote.title);
        setContent(currentContent || '');
      }
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
          key={currentNote?.id}
          content={content}
          setContent={setContent}
          handleSave={handleSave}
          isNewNote={!currentNote}
          noteId={currentNote?.id}
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
