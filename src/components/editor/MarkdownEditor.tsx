import { Bold, Italic, Strikethrough } from 'lucide-react';
import { useEffect } from 'react';
import { Markdown } from '@tiptap/markdown';
import {
  EditorContent,
  findParentNode,
  posToDOMRect,
  useEditor,
  useEditorState
} from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { StarterKit } from '@tiptap/starter-kit';

type Props = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  handleSave: () => void;
};

export function MarkdownEditor({ content, setContent, handleSave }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        markedOptions: {
          gfm: true,
          breaks: true,
          pedantic: false
        }
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      setContent(editor.getMarkdown());
    },
    onBlur: handleSave,
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl dark:prose-invert m-5 focus:outline-none border border-gray-300 rounded-md p-4 min-w-[calc(100vw-320px)] h-[calc(100vh-240px)] overflow-auto dark:text-gray-300 dark:border-gray-700'
      }
    },
    contentType: 'markdown'
  });

  useEffect(() => {
    if (editor && content !== editor.getMarkdown()) {
      editor.commands.setContent(content, { contentType: 'markdown' });
    }
  }, [editor, content]);

  const { isBold, isItalic, isStrikethrough } = useEditorState({
    editor,
    selector: ctx => ({
      isBold: ctx.editor.isActive('bold'),
      isItalic: ctx.editor.isActive('italic'),
      isStrikethrough: ctx.editor.isActive('strike')
    })
  });

  return (
    <div>
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
            type="button">
            <Strikethrough />
          </button>
        </div>
      </BubbleMenu>

      <BubbleMenu
        editor={editor}
        shouldShow={() => editor.isActive('bulletList') || editor.isActive('orderedList')}
        getReferencedVirtualElement={() => {
          const parentNode = findParentNode(
            node => node.type.name === 'bulletList' || node.type.name === 'orderedList'
          )(editor.state.selection);
          if (parentNode) {
            const domRect = posToDOMRect(
              editor.view,
              parentNode.start,
              parentNode.start + parentNode.node.nodeSize
            );
            return {
              getBoundingClientRect: () => domRect,
              getClientRects: () => [domRect]
            };
          }
          return null;
        }}
        options={{ placement: 'top-start', offset: 8 }}>
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow flex p-0.5 gap-1">
          <button
            onClick={() => {
              const chain = editor.chain().focus();
              if (editor.isActive('bulletList')) {
                chain.toggleOrderedList();
              } else {
                chain.toggleBulletList();
              }
              chain.run();
            }}
            type="button">
            Toggle list type
          </button>
        </div>
      </BubbleMenu>

      <EditorContent editor={editor} />
    </div>
  );
}
