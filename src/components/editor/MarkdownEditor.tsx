import { Bold, Heading1, Heading2, Italic, List, Strikethrough } from 'lucide-react';
import { useEffect } from 'react';
import { Markdown } from '@tiptap/markdown';
import {
  EditorContent,
  findParentNode,
  posToDOMRect,
  useEditor,
  useEditorState
} from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import { StarterKit } from '@tiptap/starter-kit';
import { EditorToolbar } from './EditorToolbar';

type Props = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  handleSave: () => void;
  isNewNote: boolean;
};

export function MarkdownEditor({ content, setContent, handleSave, isNewNote }: Props) {
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
    onBlur: () => {
      if (!isNewNote) {
        handleSave();
      }
    },
    editorProps: {
      attributes: {
        class:
          'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl dark:prose-invert focus:outline-none p-4 min-w-[calc(100vw-320px)] h-[calc(100vh-240px)] overflow-auto dark:text-gray-300'
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
    <div className="m-5 border border-gray-300 dark:border-gray-700 rounded-md overflow-hidden flex flex-col bg-white dark:bg-gray-900">
      <EditorToolbar editor={editor} />
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
            リストタイプを切り替え
          </button>
        </div>
      </BubbleMenu>

      <FloatingMenu editor={editor}>
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow flex p-0.5 gap-1">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={
              editor.isActive('heading', { level: 1 })
                ? 'rounded bg-accent hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                : 'rounded hover:bg-gray-200 dark:hover:bg-gray-600'
            }
            title="見出し1">
            <Heading1 />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={
              editor.isActive('heading', { level: 2 })
                ? 'rounded bg-accent hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                : 'rounded hover:bg-gray-200 dark:hover:bg-gray-600'
            }
            title="見出し2">
            <Heading2 />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={
              editor.isActive('bulletList')
                ? 'rounded bg-accent hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
                : 'rounded hover:bg-gray-200 dark:hover:bg-gray-600'
            }
            title="箇条書き">
            <List />
          </button>
        </div>
      </FloatingMenu>

      <EditorContent editor={editor} />
    </div>
  );
}
