import { useRef, Dispatch, SetStateAction } from "react";
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
} from "lucide-react";

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
  const insertMarkdown = (before: string, after: string = "") => {
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
      placeholderText = "";
    } else {
      // テキストが選択されていない場合
      placeholderText = before === "\n```\n" ? "code" : "text";
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
    const prefix = "#".repeat(level) + " ";
    insertMarkdown(prefix);
  };

  // リストの挿入
  const insertList = (ordered: boolean = false) => {
    const prefix = ordered ? "1. " : "- ";
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
      insertMarkdown("[", "](url)");
    } else {
      insertMarkdown("[link text](url)");
    }
  };

  // 画像の挿入
  const insertImage = () => {
    insertMarkdown("![alt text](image-url)");
  };

  // コードブロックの挿入
  const insertCodeBlock = () => {
    insertMarkdown("\n```\n", "\n```\n");
  };

  // 引用の挿入
  const insertQuote = () => {
    insertMarkdown("> ");
  };

  return (
    <div className="flex flex-col h-[calc(100vh-222px)] bg-white">
      {/* ツールバー */}
      <div className="border-b border-gray-200 flex flex-wrap gap-1 bg-gray-50">
        <button
          onClick={() => insertHeading(1)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="見出し1"
        >
          <Heading1 size={20} />
        </button>
        <button
          onClick={() => insertHeading(2)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="見出し2"
        >
          <Heading2 size={20} />
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          onClick={() => insertMarkdown("**", "**")}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="太字"
        >
          <Bold size={20} />
        </button>
        <button
          onClick={() => insertMarkdown("*", "*")}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="斜体"
        >
          <Italic size={20} />
        </button>
        <button
          onClick={() => insertMarkdown("~~", "~~")}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="取り消し線"
        >
          <Strikethrough size={20} />
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          onClick={() => insertList(false)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="箇条書きリスト"
        >
          <List size={20} />
        </button>
        <button
          onClick={() => insertList(true)}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="番号付きリスト"
        >
          <ListOrdered size={20} />
        </button>
        <button
          onClick={insertQuote}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="引用"
        >
          <Quote size={20} />
        </button>
        <div className="w-px bg-gray-300 mx-1"></div>
        <button
          onClick={insertLink}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="リンク"
        >
          <Link2 size={20} />
        </button>
        <button
          onClick={insertImage}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="画像"
        >
          <ImageIcon size={20} />
        </button>
        <button
          onClick={insertCodeBlock}
          className="p-2 hover:bg-gray-200 rounded transition-colors font-mono text-sm"
          title="コードブロック"
        >
          {"</>"}
        </button>
        <button
          onClick={() => insertMarkdown("`", "`")}
          className="p-2 hover:bg-gray-200 rounded transition-colors font-mono text-xs"
          title="インラインコード"
        >
          code
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={content}
        spellCheck={false}
        onChange={(e) => setContent(e.target.value)}
        onBlur={onBlur}
        className="flex-1 w-full p-0.5 font-mono text-sm resize-none focus:outline-none border-none"
        placeholder="マークダウンを入力してください..."
      />
    </div>
  );
}
