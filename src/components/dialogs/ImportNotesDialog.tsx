import { FileUp } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { open as openDialog } from '@tauri-apps/plugin-dialog';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { importNotes } from '@/lib/api/notes';
import { useNoteStore } from '@/stores/notes';

type ImportNotesDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: number | null;
};

export function ImportNotesDialog({ open, onOpenChange, parentId = null }: ImportNotesDialogProps) {
  const [isImporting, setIsImporting] = useState(false);
  const { loadNotes } = useNoteStore();

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

      toast.success(`${filePaths.length}個のノートをインポートしました`);

      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'ノートのインポートに失敗しました');
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
          <DialogTitle>ノートをインポート</DialogTitle>
          <DialogDescription>
            Markdownファイル (.md) を選択してインポートします。 複数のファイルを同時に選択できます。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}>
            キャンセル
          </Button>
          <Button
            onClick={handleImport}
            disabled={isImporting}>
            <FileUp className="mr-2 h-4 w-4" />
            {isImporting ? 'インポート中...' : 'ファイルを選択'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
