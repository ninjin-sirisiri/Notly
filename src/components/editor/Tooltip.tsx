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
};

export function Tooltip({ handleSave, isLoading }: Props) {
  return (
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
        <Button variant="ghost">
          <Bold className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button variant="ghost">
          <Italic className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button variant="ghost">
          <Strikethrough className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button variant="ghost">
          <List className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
        <Button variant="ghost">
          <ListOrdered className="h-4 w-4 md:h-5 md:w-5 text-[#666666]" />
        </Button>
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
          disabled={isLoading}>
          <Save className="h-3.5 w-3.5 md:h-4 md:w-4" />
          <span className="hidden sm:inline">保存</span>
        </Button>
      </div>
    </div>
  );
}
