import { FileText, ChevronDown } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useTemplateStore } from '@/stores/templates';

export function CreateNoteButton({
  onClick,
  disabled,
  onTemplateSelect
}: {
  onClick: () => void;
  disabled: boolean;
  onTemplateSelect: () => void;
}) {
  const { templates, loadTemplates } = useTemplateStore();

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  return (
    <div className="flex">
      <Button
        variant="secondary"
        size="sm"
        onClick={onClick}
        disabled={disabled}
        className="rounded-r-none border-r border-r-border/50">
        <FileText className="h-4 w-4" />
        ノート
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="sm"
            disabled={disabled}
            className="rounded-l-none px-2">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuItem onClick={onClick}>
            <FileText className="mr-2 h-4 w-4" />
            空のノート
          </DropdownMenuItem>
          {templates.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onTemplateSelect}>
                <FileText className="mr-2 h-4 w-4" />
                テンプレートから作成
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
