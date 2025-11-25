import { FileText, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useTemplateStore } from '@/stores/templates';

type SelectTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (content: string) => void;
};

export function SelectTemplateDialog({ open, onOpenChange, onSelect }: SelectTemplateDialogProps) {
  const { templates, loadTemplates, isLoading } = useTemplateStore();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      loadTemplates();
    }
  }, [open, loadTemplates]);

  function handleSelect() {
    const selectedTemplate = templates.find(t => t.id === selectedId);
    if (selectedTemplate) {
      onSelect(selectedTemplate.content);
      onOpenChange(false);
      setSelectedId(null);
    }
  }

  function renderContent() {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground">読み込み中...</p>
        </div>
      );
    }

    if (templates.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-32 space-y-2">
          <FileText className="h-12 w-12 text-muted-foreground" />
          <p className="text-muted-foreground">テンプレートがありません</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => setSelectedId(template.id)}
            className={cn(
              'w-full text-left p-4 rounded-lg border-2 transition-all',
              'hover:border-primary/50 hover:bg-accent',
              selectedId === template.id ? 'border-primary bg-accent' : 'border-transparent bg-card'
            )}>
            <div className="space-y-1">
              <h3 className="font-semibold">{template.name}</h3>
              {template.description && (
                <p className="text-sm text-muted-foreground">{template.description}</p>
              )}
              <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                <Calendar className="h-3 w-3" />
                <span>{new Date(template.updatedAt).toLocaleDateString('ja-JP')}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>テンプレートを選択</DialogTitle>
          <DialogDescription>テンプレートを選択して新しいノートを作成します</DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] pr-4">{renderContent()}</ScrollArea>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setSelectedId(null);
            }}>
            キャンセル
          </Button>
          <Button
            type="button"
            onClick={handleSelect}
            disabled={!selectedId || isLoading}>
            選択
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
