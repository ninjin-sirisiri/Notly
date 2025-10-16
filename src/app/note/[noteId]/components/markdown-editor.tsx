import { useRef, Dispatch, SetStateAction } from 'react';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Heading1,
  Heading2,
  Strikethrough,
  Quote,
} from 'lucide-react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Button } from '@/components/ui/button';

export default function MarkdownEditor({
  content,
  setContent,
  onBlur,
}: {
  content: string;
  setContent: Dispatch<SetStateAction<string>>;
  onBlur: () => void;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // テキストの選択範囲を取得して、マークダウン記法を適用
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const beforeText = content.substring(0, start);
    const afterText = content.substring(end);

    let newText: string;
    let newCursorPos: number;
    let placeholderText: string;

    if (selectedText) {
      // テキストが選択されている場合
      newText = beforeText + before + selectedText + after + afterText;
      newCursorPos = start + before.length + selectedText.length + after.length;
      placeholderText = '';
    } else {
      // テキストが選択されていない場合
      placeholderText = before === '\n```\n' ? 'code' : 'text';
      newText = beforeText + before + placeholderText + after + afterText;
      newCursorPos = start + before.length;
    }

    setContent(newText);

    // カーソル位置を設定
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        newCursorPos,
        newCursorPos + (selectedText ? 0 : placeholderText.length)
      );
    }, 0);
  };

  // 見出しの挿入
  const insertHeading = (level: number) => {
    const prefix = '#'.repeat(level) + ' ';
    insertMarkdown(prefix);
  };

  // リストの挿入
  const insertList = (ordered: boolean = false) => {
    const prefix = ordered ? '1. ' : '- ';
    insertMarkdown(prefix);
  };

  // リンクの挿入
  const insertLink = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    if (selectedText) {
      insertMarkdown('[', '](url)');
    } else {
      insertMarkdown('[link text](url)');
    }
  };

  // 画像の挿入
  const insertImage = () => {
    insertMarkdown('![alt text](image-url)');
  };

  // コードブロックの挿入
  const insertCodeBlock = () => {
    insertMarkdown('\n```\n', '\n```\n');
  };

  // 引用の挿入
  const insertQuote = () => {
    insertMarkdown('> ');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-222px)] bg-card">
      {/* ツールバー */}
      <div className="border-b border-border flex flex-wrap gap-1 bg-muted">
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => insertHeading(1)}
              className="h-auto w-auto p-2"
            >
              <Heading1 size={20} />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto px-2 py-1">
            <span className="text-xs">見出し1</span>
          </HoverCardContent>
        </HoverCard>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => insertHeading(2)}
              className="h-auto w-auto p-2"
            >
              <Heading2 size={20} />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto px-2 py-1">
            <span className="text-xs">見出し2</span>
          </HoverCardContent>
        </HoverCard>
        <div className="w-px bg-border mx-1"></div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown('**', '**')}
              className="h-auto w-auto p-2"
            >
              <Bold size={20} />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto px-2 py-1">
            <span className="text-xs">太字</span>
          </HoverCardContent>
        </HoverCard>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown('*', '*')}
              className="h-auto w-auto p-2"
            >
              <Italic size={20} />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto px-2 py-1">
            <span className="text-xs">斜体</span>
          </HoverCardContent>
        </HoverCard>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown('~~', '~~')}
              className="h-auto w-auto p-2"
            >
              <Strikethrough size={20} />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto px-2 py-1">
            <span className="text-xs">取り消し線</span>
          </HoverCardContent>
        </HoverCard>
        <div className="w-px bg-border mx-1"></div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => insertList(false)}
              className="h-auto w-auto p-2"
            >
              <List size={20} />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto px-2 py-1">
            <span className="text-xs">箇条書きリスト</span>
          </HoverCardContent>
        </HoverCard>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => insertList(true)}
              className="h-auto w-auto p-2"
            >
              <ListOrdered size={20} />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto px-2 py-1">
            <span className="text-xs">番号付きリスト</span>
          </HoverCardContent>
        </HoverCard>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="ghost" size="icon" onClick={insertQuote} className="h-auto w-auto p-2">
              <Quote size={20} />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto px-2 py-1">
            <span className="text-xs">引用</span>
          </HoverCardContent>
        </HoverCard>
        <div className="w-px bg-border mx-1"></div>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="ghost" size="icon" onClick={insertLink} className="h-auto w-auto p-2">
              <Link2 size={20} />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto px-2 py-1">
            <span className="text-xs">リンク</span>
          </HoverCardContent>
        </HoverCard>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button variant="ghost" size="icon" onClick={insertImage} className="h-auto w-auto p-2">
              <ImageIcon size={20} />
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto px-2 py-1">
            <span className="text-xs">画像</span>
          </HoverCardContent>
        </HoverCard>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={insertCodeBlock}
              className="h-auto w-auto p-2 font-mono text-sm"
            >
              {'</>'}
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto px-2 py-1">
            <span className="text-xs">コードブロック</span>
          </HoverCardContent>
        </HoverCard>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => insertMarkdown('`', '`')}
              className="h-auto w-auto p-2 font-mono text-xs"
            >
              code
            </Button>
          </HoverCardTrigger>
          <HoverCardContent className="w-auto px-2 py-1">
            <span className="text-xs">インラインコード</span>
          </HoverCardContent>
        </HoverCard>
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        spellCheck={false}
        onChange={(e) => setContent(e.target.value)}
        onBlur={onBlur}
        className="flex-1 w-full p-0.5 font-mono text-sm resize-none focus:outline-none border-none bg-transparent placeholder:text-muted-foreground"
        placeholder="マークダウンを入力してください..."
      />
    </div>
  );
}
