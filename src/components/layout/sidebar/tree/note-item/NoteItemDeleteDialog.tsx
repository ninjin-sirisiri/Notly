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
import { useTranslation } from '@/hooks/useTranslation';

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
  const { t } = useTranslation();

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogs.deleteNote.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('dialogs.deleteNote.description', { title: noteTitle })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('actions.cancel')}</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>{t('actions.delete')}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
