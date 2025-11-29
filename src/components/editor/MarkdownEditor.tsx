import { useEffect } from 'react';
import { EditorContent } from '@tiptap/react';
import { useMarkdownEditor } from './hooks/useMarkdownEditor';
import { BubbleMenus } from './menus';
import { EditorToolbar } from './toolbar/EditorToolbar';

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

  // When opening an empty note, ensure no text is selected.
  useEffect(() => {
    if (editor && content === '') {
      const timer = setTimeout(() => {
        if (editor.isFocused) {
          editor.commands.focus();
          editor.commands.setTextSelection(0);
        }
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [editor, content]);

  return (
    <div className="m-5 border border-border rounded-md overflow-hidden flex flex-col bg-card">
      <EditorToolbar editor={editor} />
      <BubbleMenus editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
