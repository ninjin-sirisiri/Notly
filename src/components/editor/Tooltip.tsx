import {
  Bold,
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImageIcon,
  Italic,
  Link,
  List,
  ListOrdered,
  Save,
  Strikethrough
} from 'lucide-react';

import { Button } from '../ui/button';

type Props = {
  handleSave: () => void;
  isLoading: boolean;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  setContent: React.Dispatch<React.SetStateAction<string>>;
};

export function Tooltip({ handleSave, isLoading, textareaRef, setContent }: Props) {
  function insertText(insertValue: string, resultCursorPos: number) {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.slice(0, start) + insertValue + text.slice(end);
    textarea.value = newText;

    setContent(newText);

    requestAnimationFrame(() => {
      textarea.focus();
      const cursorPos = start + resultCursorPos;
      textarea.setSelectionRange(cursorPos, cursorPos);
    });
  }

  return (
    <div className="flex items-center border border-b-0 border-[#EAEAEA] dark:border-[#333333] bg-background-light dark:bg-[#1A1A1A] px-2 py-1.5 rounded-t-lg overflow-x-auto">
      <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
        <Button
          variant="ghost"
          title="見出し1"
          onClick={() => insertText('# ', 2)}>
          <Heading1 className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button
          variant="ghost"
          title="見出し2"
          onClick={() => insertText('## ', 3)}>
          <Heading2 className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button
          variant="ghost"
          title="見出し3"
          onClick={() => insertText('### ', 4)}>
          <Heading3 className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button
          variant="ghost"
          title="太字"
          onClick={() => insertText('****', 2)}>
          <Bold className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button
          variant="ghost"
          title="斜体"
          onClick={() => insertText('**', 1)}>
          <Italic className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button
          variant="ghost"
          title="取り消し線"
          onClick={() => insertText('~~', 1)}>
          <Strikethrough className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button
          variant="ghost"
          title="リスト"
          onClick={() => insertText('- ', 2)}>
          <List className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button
          variant="ghost"
          title="番号付きリスト"
          onClick={() => insertText('1. ', 3)}>
          <ListOrdered className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button
          variant="ghost"
          title="リンク"
          onClick={() => insertText('[]()', 1)}>
          <Link className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button
          variant="ghost"
          title="画像"
          onClick={() => insertText('![]()', 2)}>
          <ImageIcon className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button
          variant="ghost"
          title="コード"
          onClick={() => insertText('``', 1)}>
          <Code className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button
          variant="ghost"
          title="コードブロック"
          onClick={() => insertText('``````', 3)}>
          <Code className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
      </div>
      <div className="ml-auto pl-2 shrink-0">
        <Button
          onClick={handleSave}
          disabled={isLoading}>
          <Save className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="hidden sm:inline">保存</span>
        </Button>
      </div>
    </div>
  );
}
