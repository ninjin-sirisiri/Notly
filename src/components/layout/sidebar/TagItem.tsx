import { Hash, Pencil, Trash } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger
} from '@/components/ui/context-menu';
import { cn } from '@/lib/utils';
import { useFileStore } from '@/stores/files';
import { useTagStore } from '@/stores/tags';
import { type Tag } from '@/types/tags';

type TagItemProps = {
  tag: Tag;
  onEdit: () => void;
};

export function TagItem({ tag, onEdit }: TagItemProps) {
  const { setSelectedTagId, selectedTagId } = useFileStore();
  const { deleteTag } = useTagStore();
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const isSelected = selectedTagId === tag.id;

  async function handleDelete() {
    try {
      await deleteTag(tag.id);
      toast.success('タグを削除しました');
      if (isSelected) {
        setSelectedTagId(null);
      }
    } catch (error) {
      toast.error('タグの削除に失敗しました', {
        description: String(error)
      });
    }
  }

  return (
    <>
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            className={cn(
              'flex items-center gap-2 px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 cursor-pointer transition-colors group',
              isSelected && 'bg-accent text-foreground'
            )}
            onClick={() => setSelectedTagId(isSelected ? null : tag.id)}>
            <Hash
              className="w-3 h-3"
              style={{ color: tag.color || undefined }}
            />
            <span className="flex-1 truncate">{tag.name}</span>
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={onEdit}>
            <Pencil className="w-4 h-4 mr-2" />
            編集
          </ContextMenuItem>
          <ContextMenuItem
            onClick={() => setShowDeleteAlert(true)}
            className="text-destructive focus:text-destructive">
            <Trash className="w-4 h-4 mr-2" />
            削除
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>

      <AlertDialog
        open={showDeleteAlert}
        onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>タグを削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              タグ「{tag.name}」を削除してもよろしいですか？この操作は取り消せません。
              <br />
              タグが付与されているノートからタグが削除されますが、ノート自体は削除されません。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              削除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
