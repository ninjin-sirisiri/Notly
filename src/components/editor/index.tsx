import { useEffect, useState } from 'react';

import { useCurrentNote } from '@/hooks/useNote';

import { EditorHeader } from './EditorHeader';
import { MarkdownEditor } from './MarkdownEditor';

export function Editor() {
  const { currentNote, currentContent, updateNote, isLoading } = useCurrentNote();

  const [title, setTitle] = useState(currentNote?.title || '');
  const [content, setContent] = useState(currentContent || '');

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
    if (!currentNote?.id) return;
    updateNote(currentNote?.id, title, content);
  }

  return (
    <main className="flex-1 flex flex-col p-3 md:p-6">
      <EditorHeader
        title={title}
        setTitle={setTitle}
        handleSave={handleSave}
        created_at={currentNote?.created_at || new Date()}
        isLoading={isLoading}
      />
      <MarkdownEditor
        content={content}
        setContent={setContent}
      />
    </main>
  );
}
