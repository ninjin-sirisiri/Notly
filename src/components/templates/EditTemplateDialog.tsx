import { useState, useEffect } from 'react';
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
import { type Template } from '@/types/templates';

type EditTemplateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: Template;
};

// テンプレート編集時は自動保存が不要なため、空の関数を渡す
function noOpSave() {
  /* intentionally empty */
}

export function EditTemplateDialog({ open, onOpenChange, template }: EditTemplateDialogProps) {
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description || '');
  const [content, setContent] = useState(template.content);
  const { updateTemplate, isLoading } = useTemplateStore();

  useEffect(() => {
    setName(template.name);
    setDescription(template.description || '');
    setContent(template.content);
  }, [template]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      await updateTemplate({
        id: template.id,
        name,
        content,
        description: description || null
      });
      onOpenChange(false);
    } catch {
      // エラーは既にストアで処理されている
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>テンプレートを編集</DialogTitle>
          <DialogDescription>テンプレートの内容を編集します</DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-1 overflow-hidden">
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">テンプレート名</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="例: 日記テンプレート"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">説明（任意）</Label>
              <Input
                id="edit-description"
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
                isNewNote={false}
                noteId={template.id}
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
              {isLoading ? '更新中...' : '更新'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
