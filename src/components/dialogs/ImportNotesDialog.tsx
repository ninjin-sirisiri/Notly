import { open as openDialog } from '@tauri-apps/plugin-dialog';
import { FileUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import { importNotes } from '@/lib/api/notes';
import { useFileStore } from '@/stores/files';
import { useNoteStore } from '@/stores/notes';

type ImportNotesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: number | null;
};

export function ImportNotesDialog({ open, onOpenChange, parentId = null }: ImportNotesDialogProps) {
  const [isImporting, setIsImporting] = useState(false);
  const { loadNotes } = useNoteStore();
  const { t } = useTranslation();

  async function handleImport() {
    try {
      const selected = await openDialog({
        multiple: true,
        filters: [
          {
            name: 'Markdown',
            extensions: ['md', 'markdown']
          }
        ]
      });

      if (!selected) return;

      setIsImporting(true);

      const filePaths = Array.isArray(selected) ? selected : [selected];
      await importNotes(filePaths, parentId);
      await loadNotes();

      // Update file store to refresh sidebar
      useFileStore.getState().loadFiles();

      toast.success(t('messages.notesImported', { count: filePaths.length }));

      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('dialogs.importNotes.importFailed'));
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dialogs.importNotes.title')}</DialogTitle>
          <DialogDescription>{t('dialogs.importNotes.description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}>
            {t('actions.cancel')}
          </Button>
          <Button
            onClick={handleImport}
            disabled={isImporting}>
            <FileUp className="mr-2 h-4 w-4" />
            {isImporting
              ? t('dialogs.importNotes.importing')
              : t('dialogs.importNotes.selectFiles')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
