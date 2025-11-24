import { Bold, Italic, Strikethrough } from 'lucide-react';
import { useEditorState, type Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';

type TextBubbleMenuProps = {
  editor: Editor;
};

export function TextBubbleMenu({ editor }: TextBubbleMenuProps) {
  const editorState = useEditorState({
    editor,
    selector: ctx => {
      if (!ctx.editor) return null;
      return {
        isBold: ctx.editor.isActive('bold'),
        isItalic: ctx.editor.isActive('italic'),
        isStrikethrough: ctx.editor.isActive('strike')
      };
    }
  });

  const { isBold, isItalic, isStrikethrough } = editorState || {
    isBold: false,
    isItalic: false,
    isStrikethrough: false
  };

  return (
    <BubbleMenu
      editor={editor}
      options={{ placement: 'bottom', offset: 8, flip: true }}>
      <div className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-700 rounded shadow flex p-0.5 gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={
            isBold
              ? 'rounded bg-accent hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
              : 'rounded hover:bg-gray-200 dark:hover:bg-gray-600'
          }
          title="太字"
          type="button">
          <Bold />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={
            isItalic
              ? 'rounded bg-accent hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
              : 'rounded hover:bg-gray-200 dark:hover:bg-gray-600'
          }
          title="斜体"
          type="button">
          <Italic />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={
            isStrikethrough
              ? 'rounded bg-accent hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
              : 'rounded hover:bg-gray-200 dark:hover:bg-gray-600'
          }
          title="打ち消し線"
          type="button">
          <Strikethrough />
        </button>
      </div>
    </BubbleMenu>
  );
}
