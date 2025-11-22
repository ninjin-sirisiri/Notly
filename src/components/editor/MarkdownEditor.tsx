import { Bold, Heading1, Heading2, Italic, List, Strikethrough } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useNoteStore } from '@/stores/notes';
import { Markdown } from '@tiptap/markdown';
import {
  EditorContent,
  findParentNode,
  posToDOMRect,
  useEditor,
  useEditorState,
  type JSONContent
} from '@tiptap/react';
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';
import { StarterKit } from '@tiptap/starter-kit';
import { EditorToolbar } from './EditorToolbar';
import { AutoCloseExtension } from './extensions/AutoCloseExtension';
import { NoteLinkExtension } from './extensions/NoteLinkExtension';

type Props = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  handleSave: () => void;
  isNewNote: boolean;
  noteId?: number;
};

// JSONをMarkdownに変換する際、noteLinkノードを[[]]形式に変換
function processNode(node: JSONContent): string {
  if (node.type === 'noteLink') {
    const noteName = node.attrs?.noteName || '';
    return `[[${noteName}]]`;
  }

  if (node.type === 'text') {
    return node.text || '';
  }

  if (node.content) {
    // contentを処理する前に、noteLinkノードの前後の[[と]]を削除
    const filteredContent = node.content.filter((child: JSONContent, index: number) => {
      // noteLinkの直前の[[を除去
      if (
        child.type === 'text' &&
        child.text === '[[' &&
        index < (node.content?.length || 0) - 1 &&
        node.content?.[index + 1].type === 'noteLink'
      ) {
        return false;
      }
      // noteLinkの直後の]]を除去
      if (
        child.type === 'text' &&
        child.text === ']]' &&
        index > 0 &&
        node.content?.[index - 1].type === 'noteLink'
      ) {
        return false;
      }
      return true;
    });

    const contentText = filteredContent.map((child: JSONContent) => processNode(child)).join('');

    // ノードタイプに応じてフォーマット
    switch (node.type) {
      case 'paragraph':
        return `${contentText}\n\n`;
      case 'heading':
        return `${'#'.repeat(node.attrs?.level || 1)} ${contentText}\n\n`;
      case 'bulletList':
        return contentText;
      case 'orderedList':
        return contentText;
      case 'listItem':
        return `- ${contentText.trim()}\n`;
      case 'codeBlock':
        return `\`\`\`\n${contentText}\`\`\`\n\n`;
      case 'blockquote':
        return `> ${contentText.trim()}\n\n`;
      case 'hardBreak':
        return '\n';
      default:
        return contentText;
    }
  }

  return '';
}

// NoteLinkノードを含むMarkdownを取得する関数
function getNoteLinkMarkdown(editor: ReturnType<typeof useEditor>) {
  if (!editor) return '';

  const json = editor.getJSON();
  return processNode(json).trim();
}

export function MarkdownEditor({ content, setContent, handleSave, isNewNote, noteId }: Props) {
  const { loadNote, createNote } = useNoteStore();
  const previousNoteIdRef = useRef<number | undefined>(noteId);
  const isUpdatingRef = useRef(false);

  // ノートリンククリック時の処理
  async function handleNoteLinkClick(noteName: string) {
    // 現在のノートを保存
    const { currentNote, currentContent, updateNote } = useNoteStore.getState();
    if (currentNote && currentContent) {
      await updateNote(currentNote.id, currentNote.title, currentContent);
    }

    // 最新のnotesを取得
    const { notes } = useNoteStore.getState();

    // タイトルが一致するノートを検索
    const targetNote = notes.find(note => note.title === noteName);

    if (targetNote) {
      // 既存のノートを開く
      await loadNote(targetNote.id);
    } else {
      // ノートが存在しない場合は新規作成
      await createNote(noteName, '', '', null);
    }
  }

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown.configure({
        markedOptions: {
          gfm: true,
          breaks: true,
          pedantic: false
        }
      }),
      NoteLinkExtension.configure({
        onLinkClick: handleNoteLinkClick
      }),
      AutoCloseExtension
    ],
    content,
    onUpdate: ({ editor }) => {
      // プログラム的な更新中は無視
      if (isUpdatingRef.current) {
        return;
      }

      // カスタムMarkdown変換を使用してNoteLinkノードを[[]]として保存
      const markdown = getNoteLinkMarkdown(editor);
      setContent(markdown);
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
    if (!editor) return;

    const noteIdChanged = previousNoteIdRef.current !== noteId;
    // Use the same custom markdown conversion as onUpdate to prevent unnecessary updates
    const currentMarkdown = getNoteLinkMarkdown(editor);
    const newContent = content.trim();

    // ノートIDが変わっていない場合は、コンテンツが同じなら更新しない
    if (!noteIdChanged && currentMarkdown === newContent) {
      return;
    }

    // ノートIDを更新
    previousNoteIdRef.current = noteId;

    // プログラム的な更新を開始
    isUpdatingRef.current = true;

    // [[]]が含まれている場合は、カスタムパーサーを使用
    if (content.includes('[[') && content.includes(']]')) {
      // シンプルなMarkdownパーサー: 段落とNoteLinkをサポート
      const lines = content.split('\n\n');
      const docContent: JSONContent[] = [];

      for (const line of lines) {
        if (!line.trim()) continue;

        const paragraphContent: JSONContent[] = [];
        let remaining = line;
        const regex = /\[\[([^\]]+)\]\]/g;
        let lastIndex = 0;
        let match;

        while ((match = regex.exec(remaining)) !== null) {
          // マッチの前のテキスト
          if (match.index > lastIndex) {
            const beforeText = remaining.slice(lastIndex, match.index);
            if (beforeText) {
              paragraphContent.push({
                type: 'text',
                text: beforeText
              });
            }
          }

          // NoteLinkノード
          paragraphContent.push({
            type: 'noteLink',
            attrs: { noteName: match[1] }
          });

          lastIndex = match.index + match[0].length;
        }

        // 残りのテキスト
        if (lastIndex < remaining.length) {
          const afterText = remaining.slice(lastIndex);
          if (afterText) {
            paragraphContent.push({
              type: 'text',
              text: afterText
            });
          }
        }

        if (paragraphContent.length > 0) {
          docContent.push({
            type: 'paragraph',
            content: paragraphContent
          });
        }
      }

      // 空のドキュメントの場合
      if (docContent.length === 0) {
        docContent.push({ type: 'paragraph' });
      }

      // JSONとして設定
      editor.commands.setContent({ type: 'doc', content: docContent });
    } else {
      // [[]]が含まれていない場合は通常のMarkdownとして設定
      editor.commands.setContent(content, { contentType: 'markdown' });
    }

    // プログラム的な更新を終了（次のフレームで）
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  }, [editor, content, noteId]);

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
