import { useState } from 'react';
import { toast } from 'sonner';
import { MarkdownEditor } from '@/components/editor/MarkdownEditor';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTemplateStore } from '@/stores/templates';

type CreateTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialContent?: string;
};

// テンプレート編集時は自動保存が不要なため、空の関数を渡す
function noOpSave() {
  /* intentionally empty */
}

export function CreateTemplateDialog({
  open,
  onOpenChange,
  initialContent = ''
}: CreateTemplateDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState(initialContent);
  const { createTemplate, isLoading } = useTemplateStore();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await createTemplate({
        name,
        content,
        description: description || null
      });
      // Reset form
      setName('');
      setDescription('');
      setContent('');
      onOpenChange(false);
    } catch {
      toast.error('Failed to create template');
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>新しいテンプレートを作成</DialogTitle>
          <DialogDescription>
            ノートを素早く作成するためのテンプレートを作成します
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">テンプレート名</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例: 日記テンプレート"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">説明（任意）</Label>
              <Input
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="このテンプレートの説明"
              />
            </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <Label>テンプレート内容</Label>
            <div className="mt-2 h-[400px] overflow-hidden">
              <MarkdownEditor
                content={content}
                setContent={setContent}
                handleSave={noOpSave}
                isNewNote
              />
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button
              type="submit"
              disabled={isLoading}>
              {isLoading ? '作成中...' : '作成'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
