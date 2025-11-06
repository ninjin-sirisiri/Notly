import { Button } from './ui/button';
import { useCurrentNote } from '@/hooks/useNote';
import {
  Heading1,
  Heading2,
  Heading3,
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  Code,
  Save
} from 'lucide-react';
import { useEffect, useState } from 'react';

export function Editor() {
  const { currentNote, currentContent, updateNote, isLoading } =
    useCurrentNote();

  const [title, setTitle] = useState(currentNote?.title || '');
  const [content, setContent] = useState(currentContent || '');

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentContent || '');
    }
  }, [currentNote, currentContent]);

  const handleSave = () => {
    console.log(JSON.stringify(currentNote, null, 2));
    if (!currentNote?.id) return;
    updateNote(currentNote?.id, title, content);
  };

  return (
    <main className="flex-1 flex flex-col p-3 md:p-6 overflow-y-auto">
      <div className="shrink-0 mb-4">
        <div className="flex sm:items-baseline sm:justify-between gap-2">
          <input
            className="w-full text-2xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-primary dark:text-white p-0.5"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {currentNote?.created_at.toLocaleString()}
          </span>
        </div>
      </div>
      <div className="flex flex-col flex-1">
        <div className="flex flex-col h-full flex-1">
          <div className="flex w-full flex-1 items-stretch rounded-lg flex-col">
            <div className="flex flex-1 flex-col">
              <div className="flex items-center border border-b-0 border-[#EAEAEA] dark:border-[#333333] bg-background-light dark:bg-[#1A1A1A] px-2 py-1.5 rounded-t-lg overflow-x-auto">
                <div className="flex items-center gap-0.5 md:gap-1 shrink-0">
                  <Button variant="ghost">
                    <Heading1 className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
                  </Button>
                  <Button variant="ghost">
                    <Heading2 className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
                  </Button>
                  <Button variant="ghost">
                    <Heading3 className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
                  </Button>
                  <div className="h-5 w-px bg-[#EAEAEA] dark:bg-[#333333] mx-0.5 md:mx-1"></div>
                  <Button variant="ghost">
                    <Bold className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
                  </Button>
                  <Button variant="ghost">
                    <Italic className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
                  </Button>
                  <Button variant="ghost">
                    <Strikethrough className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
                  </Button>
                  <div className="h-5 w-px bg-[#EAEAEA] dark:bg-[#333333] mx-0.5 md:mx-1"></div>
                  <Button variant="ghost">
                    <List className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
                  </Button>
                  <Button variant="ghost">
                    <ListOrdered className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
                  </Button>
                  <div className="h-5 w-px bg-[#EAEAEA] dark:bg-[#333333] mx-0.5 md:mx-1"></div>
                  <Button variant="ghost">
                    <Link className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
                  </Button>
                  <Button variant="ghost">
                    <ImageIcon className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
                  </Button>
                  <Button variant="ghost">
                    <Code className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
                  </Button>
                </div>
                <div className="ml-auto pl-2 shrink-0">
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    <Save className="h-3.5 w-3.5 md:h-4 md:w-4" />
                    <span className="hidden sm:inline">保存</span>
                  </Button>
                </div>
              </div>
              <textarea
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-auto rounded-t-none rounded-b-lg bg-background-light dark:bg-[#1A1A1A] text-[#1A1A1A] dark:text-white focus:outline-0 focus:ring-0 border border-[#EAEAEA] dark:border-[#333333] focus:border-[#666666] dark:focus:border-[#666666] min-h-36 placeholder:text-[#666666] p-3 md:p-4 text-sm md:text-base font-normal leading-normal"
                placeholder="ここにノートを入力..."
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
