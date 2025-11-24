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

type NoteItemDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  noteTitle: string;
  onConfirm: () => void;
};

export function NoteItemDeleteDialog({
  open,
  onOpenChange,
  noteTitle,
  onConfirm
}: NoteItemDeleteDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>ノートを削除しますか？</AlertDialogTitle>
          <AlertDialogDescription>
            「{noteTitle}」を削除します。この操作は取り消せません。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>キャンセル</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>削除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
