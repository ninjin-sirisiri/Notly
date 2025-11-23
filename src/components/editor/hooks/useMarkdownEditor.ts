import { useEffect, useRef } from 'react';
import { useNoteStore } from '@/stores/notes';
import { Markdown } from '@tiptap/markdown';
import { useEditor } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { AutoCloseExtension } from '../extensions/AutoCloseExtension';
import { NoteLinkExtension } from '../extensions/NoteLinkExtension';
import { getNoteLinkMarkdown, parseMarkdownWithNoteLinks } from '../utils/markdownConverter';

type UseMarkdownEditorProps = {
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  handleSave: () => void;
  isNewNote: boolean;
  noteId?: number;
};

export function useMarkdownEditor({
  content,
  setContent,
  handleSave,
  isNewNote,
  noteId
}: UseMarkdownEditorProps) {
  const { loadNote, createNote } = useNoteStore();
  const previousNoteIdRef = useRef<number | undefined>(noteId);
  const isUpdatingRef = useRef(false);

  /**
   * ノートリンククリック時の処理
   */
  async function handleNoteLinkClick(noteName: string) {
    // 現在のノートを保存
    const { currentNote, currentContent, updateNote } = useNoteStore.getState();
    if (currentNote && currentContent) {
      await updateNote(currentNote.id, currentNote.title, currentContent);
    }

    // 最新のnotesを取得
    const { notes } = useNoteStore.getState();

    // ノートを検索
    let targetNote = notes.find(note => {
      // パスが含まれている場合（フォルダ/ノート名）
      if (noteName.includes('/') || noteName.includes('\\')) {
        // パスセパレータを統一して比較
        const normalizedNotePath = note.file_path.replaceAll('\\', '/');
        const normalizedLinkPath = noteName.replaceAll('\\', '/');
        // ファイルパスがリンクパスで終わるかチェック（拡張子なしの比較も考慮）
        return (
          normalizedNotePath.endsWith(normalizedLinkPath) ||
          normalizedNotePath.endsWith(`${normalizedLinkPath}.md`)
        );
      }
      // タイトルのみの場合
      return note.title === noteName;
    });

    // タイトルのみで検索して、重複がある場合はパスで絞り込むロジックが必要だが、
    // ここでは単純にタイトル一致の最初のものを返す（既存動作）か、
    // パス指定があればそれを優先する形にする。

    if (targetNote) {
      // 既存のノートを開く
      await loadNote(targetNote.id);
    } else {
      // ノートが存在しない場合は新規作成
      // パスが含まれている場合は、そのフォルダ構造で作成する必要があるが、
      // 現状は簡易的にルートまたは指定された名前で作成
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
      const docContent = parseMarkdownWithNoteLinks(content);
      editor.commands.setContent(docContent);
    } else {
      // [[]]が含まれていない場合は通常のMarkdownとして設定
      editor.commands.setContent(content, { contentType: 'markdown' });
    }

    // プログラム的な更新を終了（次のフレームで）
    setTimeout(() => {
      isUpdatingRef.current = false;
    }, 0);
  }, [editor, content, noteId]);

  return { editor };
}
