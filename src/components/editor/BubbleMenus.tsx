import { Bold, Heading1, Heading2, Italic, List, Strikethrough } from 'lucide-react';
import { findParentNode, posToDOMRect, useEditorState, type Editor } from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';

type BubbleMenusProps = {
  editor: Editor | null;
};

/**
 * BubbleMenuとFloatingMenuのコンポーネント
 */
export function BubbleMenus({ editor }: BubbleMenusProps) {
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

  if (!editor) return null;

  const { isBold, isItalic, isStrikethrough } = editorState || {
    isBold: false,
    isItalic: false,
    isStrikethrough: false
  };

  return (
    <>
      {/* テキスト選択時のBubbleMenu */}
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

      {/* リスト選択時のBubbleMenu */}
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

      {/* 空行でのFloatingMenu */}
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
    </>
  );
}
