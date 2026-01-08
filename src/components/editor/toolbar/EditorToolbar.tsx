import { type Editor } from '@tiptap/react';
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
import { useTranslation } from '@/hooks/useTranslation';

type Props = {
  editor: Editor | null;
};

export function EditorToolbar({ editor }: Props) {
  const { t } = useTranslation('editor');

  if (!editor) {
    return null;
  }

  return (
    <div className="border border-border bg-muted p-2 rounded-t-md flex flex-wrap gap-1 sticky top-0 z-10">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={
          editor.isActive('bold')
            ? 'p-1 rounded bg-accent text-accent-foreground'
            : 'p-1 rounded hover:bg-accent text-muted-foreground'
        }
        title={t('toolbar.bold')}>
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={
          editor.isActive('italic')
            ? 'p-1 rounded bg-accent text-accent-foreground'
            : 'p-1 rounded hover:bg-accent text-muted-foreground'
        }
        title={t('toolbar.italic')}>
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={
          editor.isActive('strike')
            ? 'p-1 rounded bg-accent text-accent-foreground'
            : 'p-1 rounded hover:bg-accent text-muted-foreground'
        }
        title={t('toolbar.strike')}>
        <Strikethrough size={18} />
      </button>

      <div className="w-px h-6 bg-border mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={
          editor.isActive('heading', { level: 1 })
            ? 'p-1 rounded bg-accent text-accent-foreground'
            : 'p-1 rounded hover:bg-accent text-muted-foreground'
        }
        title={t('toolbar.heading1')}>
        <Heading1 size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={
          editor.isActive('heading', { level: 2 })
            ? 'p-1 rounded bg-accent text-accent-foreground'
            : 'p-1 rounded hover:bg-accent text-muted-foreground'
        }
        title={t('toolbar.heading2')}>
        <Heading2 size={18} />
      </button>

      <div className="w-px h-6 bg-border mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={
          editor.isActive('bulletList')
            ? 'p-1 rounded bg-accent text-accent-foreground'
            : 'p-1 rounded hover:bg-accent text-muted-foreground'
        }
        title={t('toolbar.bulletList')}>
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={
          editor.isActive('orderedList')
            ? 'p-1 rounded bg-accent text-accent-foreground'
            : 'p-1 rounded hover:bg-accent text-muted-foreground'
        }
        title={t('toolbar.orderedList')}>
        <ListOrdered size={18} />
      </button>

      <div className="w-px h-6 bg-border mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={
          editor.isActive('blockquote')
            ? 'p-1 rounded bg-accent text-accent-foreground'
            : 'p-1 rounded hover:bg-accent text-muted-foreground'
        }
        title={t('toolbar.blockquote')}>
        <Quote size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={
          editor.isActive('codeBlock')
            ? 'p-1 rounded bg-accent text-accent-foreground'
            : 'p-1 rounded hover:bg-accent text-muted-foreground'
        }
        title={t('toolbar.codeBlock')}>
        <Code size={18} />
      </button>

      <div className="w-px h-6 bg-border mx-1 self-center" />

      <button
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-1 rounded hover:bg-accent text-muted-foreground disabled:opacity-50"
        title={t('toolbar.undo')}>
        <Undo size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-1 rounded hover:bg-accent text-muted-foreground disabled:opacity-50"
        title={t('toolbar.redo')}>
        <Redo size={18} />
      </button>
    </div>
  );
}
