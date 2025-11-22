import { EditorContent } from '@tiptap/react';
import { BubbleMenus } from './BubbleMenus';
import { EditorToolbar } from './EditorToolbar';
import { useMarkdownEditor } from './hooks/useMarkdownEditor';

type Props = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  handleSave: () => void;
  isNewNote: boolean;
  noteId?: number;
};

export function MarkdownEditor({ content, setContent, handleSave, isNewNote, noteId }: Props) {
  const { editor } = useMarkdownEditor({
    content,
    setContent,
    handleSave,
    isNewNote,
    noteId
  });

  return (
    <div className="m-5 border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden flex flex-col bg-white dark:bg-gray-900">
      <EditorToolbar editor={editor} />
      <BubbleMenus editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
