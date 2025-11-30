import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTagStore } from '@/stores/tags';

type TagDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tagId?: number; // If provided, we are editing
  initialName?: string;
  initialColor?: string | null;
};

export function TagDialog({
  open,
  onOpenChange,
  tagId,
  initialName = '',
  initialColor = null
}: TagDialogProps) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor || '#808080');
  const { createTag, updateTag } = useTagStore();

  useEffect(() => {
    if (open) {
      setName(initialName);
      setColor(initialColor || '#808080');
    }
  }, [open, initialName, initialColor]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (tagId) {
        await updateTag(tagId, name, color);
        toast.success('タグを更新しました');
      } else {
        await createTag(name, color);
        toast.success('タグを作成しました');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('エラーが発生しました', {
        description: String(error)
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{tagId ? 'タグを編集' : '新しいタグを作成'}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">タグ名</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="タグ名を入力..."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="color">色</Label>
            <div className="flex gap-2">
              <Input
                id="color"
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                value={color}
                onChange={e => setColor(e.target.value)}
                placeholder="#000000"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}>
              キャンセル
            </Button>
            <Button type="submit">{tagId ? '更新' : '作成'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
