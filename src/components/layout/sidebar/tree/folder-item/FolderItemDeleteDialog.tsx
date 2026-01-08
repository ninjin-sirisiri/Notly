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

type FolderItemDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderName: string;
  onConfirm: () => void;
};

export function FolderItemDeleteDialog({
  open,
  onOpenChange,
  folderName,
  onConfirm
}: FolderItemDeleteDialogProps) {
  const { t } = useTranslation();

  return (
    <AlertDialog
      open={open}
      onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialogs.deleteFolder.title')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('dialogs.deleteFolder.description', { name: folderName })}
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
