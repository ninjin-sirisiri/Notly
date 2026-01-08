import { open, save } from '@tauri-apps/plugin-dialog';
import { Download, Upload, Info } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/useTranslation';
import {
  createBackup,
  restoreBackup,
  readBackupMetadata,
  type BackupMetadata
} from '@/lib/api/backup';
import { formatDateTime, formatISODate } from '@/lib/dateFormat';

export function BackupSettings() {
  const { t } = useTranslation('settings');
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState<string | null>(null);
  const [backupMetadata, setBackupMetadata] = useState<BackupMetadata | null>(null);

  async function handleCreateBackup() {
    try {
      setIsCreating(true);

      // バックアップ保存先を選択
      const selectedPath = await save({
        title: t('backup.saveBackupTitle'),
        defaultPath: `notly_backup_${formatISODate(new Date())}.zip`,
        filters: [
          {
            name: 'ZIP Archive',
            extensions: ['zip']
          }
        ]
      });

      if (!selectedPath) {
        setIsCreating(false);
        return; // ユーザーがキャンセル
      }

      // 親ディレクトリを取得
      const parentDir = selectedPath.slice(0, selectedPath.lastIndexOf('\\'));

      const backupFilePath = await createBackup(parentDir);

      toast.success(t('backup.backupSuccess'), {
        description: t('backup.backupSuccessDescription', { path: backupFilePath })
      });
    } catch (error) {
      toast.error(t('backup.backupError'), {
        description: error instanceof Error ? error.message : t('backup.backupErrorDescription')
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSelectBackupFile() {
    try {
      const selected = await open({
        title: t('backup.selectBackupTitle'),
        multiple: false,
        filters: [
          {
            name: 'ZIP Archive',
            extensions: ['zip']
          }
        ]
      });

      if (!selected || typeof selected !== 'string') {
        return;
      }

      setSelectedBackupFile(selected);

      // メタデータを読み取る
      const metadata = await readBackupMetadata(selected);
      setBackupMetadata(metadata);
      setRestoreDialogOpen(true);
    } catch (error) {
      toast.error(t('backup.readError'), {
        description: error instanceof Error ? error.message : t('backup.readErrorDescription')
      });
    }
  }

  async function handleRestoreBackup() {
    if (!selectedBackupFile) return;

    try {
      setIsRestoring(true);
      await restoreBackup(selectedBackupFile);

      toast.success(t('backup.restoreSuccess'), {
        description: t('backup.restoreSuccessDescription'),
        duration: 5000
      });

      setRestoreDialogOpen(false);
    } catch (error) {
      toast.error(t('backup.restoreError'), {
        description: error instanceof Error ? error.message : t('backup.restoreErrorDescription')
      });
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{t('backup.title')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{t('backup.description')}</p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleCreateBackup}
              disabled={isCreating}
              className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              {isCreating ? t('backup.creatingBackup') : t('backup.createBackup')}
            </Button>

            <Button
              onClick={handleSelectBackupFile}
              disabled={isRestoring}
              variant="outline"
              className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              {t('backup.restoreBackup')}
            </Button>
          </div>

          <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-500">{t('backup.aboutTitle')}</p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>{t('backup.aboutItems.includes')}</li>
                  <li>{t('backup.aboutItems.recommend')}</li>
                  <li>{t('backup.aboutItems.overwrite')}</li>
                  <li>{t('backup.aboutItems.restart')}</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={restoreDialogOpen}
        onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('backup.restoreDialog.title')}</DialogTitle>
            <DialogDescription>{t('backup.restoreDialog.description')}</DialogDescription>
          </DialogHeader>

          {backupMetadata && (
            <div className="space-y-2 rounded-lg border p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">{t('backup.restoreDialog.version')}</div>
                <div>{backupMetadata.version}</div>

                <div className="text-muted-foreground">{t('backup.restoreDialog.createdAt')}</div>
                <div>{formatDateTime(backupMetadata.created_at)}</div>

                <div className="text-muted-foreground">{t('backup.restoreDialog.notesCount')}</div>
                <div>{backupMetadata.notes_count}</div>

                <div className="text-muted-foreground">
                  {t('backup.restoreDialog.foldersCount')}
                </div>
                <div>{backupMetadata.folders_count}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestoreDialogOpen(false)}
              disabled={isRestoring}>
              {t('backup.restoreDialog.cancel')}
            </Button>
            <Button
              onClick={handleRestoreBackup}
              disabled={isRestoring}>
              {isRestoring
                ? t('backup.restoreDialog.restoring')
                : t('backup.restoreDialog.restore')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
