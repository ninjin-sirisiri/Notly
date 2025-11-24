import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Code,
  Undo,
  Redo
} from 'lucide-react';
import { type Editor } from '@tiptap/react';

type Props = {
  editor: Editor | null;
};

export function EditorToolbar({ editor }: Props) {
  if (!editor) {
    return null;
  }

  return (
    <div className="border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-2 rounded-t-md flex flex-wrap gap-1 sticky top-0 z-10">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={
          editor.isActive('bold')
            ? 'p-1 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
            : 'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
        }
        title="太字">
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={
          editor.isActive('italic')
            ? 'p-1 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
            : 'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
        }
        title="斜体">
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={
          editor.isActive('strike')
            ? 'p-1 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
            : 'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
        }
        title="打ち消し線">
        <Strikethrough size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={
          editor.isActive('heading', { level: 1 })
            ? 'p-1 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
            : 'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
        }
        title="見出し1">
        <Heading1 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={
          editor.isActive('heading', { level: 2 })
            ? 'p-1 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
            : 'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
        }
        title="見出し2">
        <Heading2 size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive('bulletList')
            ? 'p-1 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
            : 'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
        }
        title="箇条書き">
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editor.isActive('orderedList')
            ? 'p-1 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
            : 'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
        }
        title="番号付きリスト">
        <ListOrdered size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={
          editor.isActive('blockquote')
            ? 'p-1 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
            : 'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
        }
        title="引用">
        <Quote size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={
          editor.isActive('codeBlock')
            ? 'p-1 rounded bg-gray-200 dark:bg-gray-700 text-black dark:text-white'
            : 'p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
        }
        title="コードブロック">
        <Code size={18} />
      </button>

      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50"
        title="元に戻す">
        <Undo size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 disabled:opacity-50"
        title="やり直す">
        <Redo size={18} />
      </button>
    </div>
  );
}
