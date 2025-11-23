import { Heading1, Heading2, List } from 'lucide-react';
import { type Editor } from '@tiptap/react';
import { FloatingMenu } from '@tiptap/react/menus';

type EditorFloatingMenuProps = {
  editor: Editor;
};

export function EditorFloatingMenu({ editor }: EditorFloatingMenuProps) {
  return (
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
  );
}
