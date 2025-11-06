import { ContentArea } from './ContentArea';
import { EditorHeader } from './EditorHeader';
import { Tooltip } from './Tooltip';
import { useCurrentNote } from '@/hooks/useNote';
import { useEffect, useState } from 'react';

export function Editor() {
  const { currentNote, currentContent, updateNote, isLoading } =
    useCurrentNote();

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

  const handleSave = () => {
    console.log(JSON.stringify(currentNote, null, 2));
    if (!currentNote?.id) return;
    updateNote(currentNote?.id, title, content);
  };

  return (
    <main className="flex-1 flex flex-col p-3 md:p-6 overflow-y-auto">
      <EditorHeader
        title={title}
        setTitle={setTitle}
        handleSave={handleSave}
        created_at={currentNote?.created_at || new Date()}
      />
      <div className="flex flex-col flex-1">
        <div className="flex flex-col h-full flex-1">
          <div className="flex w-full flex-1 items-stretch rounded-lg flex-col">
            <div className="flex flex-1 flex-col">
              <Tooltip
                handleSave={handleSave}
                isLoading={isLoading}
              />
              <ContentArea
                content={content}
                setContent={setContent}
                handleSave={handleSave}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
