import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, Upload, Info } from 'lucide-react';
import { open, save } from '@tauri-apps/plugin-dialog';
import {
  createBackup,
  restoreBackup,
  readBackupMetadata,
  type BackupMetadata,
} from '@/lib/api/backup';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function BackupSettings() {
  const [isCreating, setIsCreating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedBackupFile, setSelectedBackupFile] = useState<string | null>(
    null
  );
  const [backupMetadata, setBackupMetadata] = useState<BackupMetadata | null>(
    null
  );

  async function handleCreateBackup() {
    try {
      setIsCreating(true);

      // バックアップ保存先を選択
      const selectedPath = await save({
        title: 'バックアップを保存',
        defaultPath: `notly_backup_${new Date().toISOString().split('T')[0]}.zip`,
        filters: [
          {
            name: 'ZIP Archive',
            extensions: ['zip'],
          },
        ],
      });

      if (!selectedPath) {
        setIsCreating(false);
        return; // ユーザーがキャンセル
      }

      // 親ディレクトリを取得
      const parentDir = selectedPath.slice(
        0,
        selectedPath.lastIndexOf('\\')
      );

      const backupFilePath = await createBackup(parentDir);

      toast.success('バックアップ完了', {
        description: `バックアップが正常に作成されました: ${backupFilePath}`,
      });
    } catch (error) {
      toast.error('バックアップ失敗', {
        description:
          error instanceof Error ? error.message : 'バックアップの作成に失敗しました',
      });
    } finally {
      setIsCreating(false);
    }
  }

  async function handleSelectBackupFile() {
    try {
      const selected = await open({
        title: 'バックアップファイルを選択',
        multiple: false,
        filters: [
          {
            name: 'ZIP Archive',
            extensions: ['zip'],
          },
        ],
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
      toast.error('バックアップ読み取り失敗', {
        description:
          error instanceof Error
            ? error.message
            : 'バックアップファイルの読み取りに失敗しました',
      });
    }
  }

  async function handleRestoreBackup() {
    if (!selectedBackupFile) return;

    try {
      setIsRestoring(true);
      await restoreBackup(selectedBackupFile);

      toast.success('復元完了', {
        description:
          'バックアップから正常に復元されました。変更を反映するには、アプリケーションを手動で再起動してください。',
        duration: 5000,
      });

      setRestoreDialogOpen(false);
    } catch (error) {
      toast.error('復元失敗', {
        description:
          error instanceof Error ? error.message : 'バックアップの復元に失敗しました',
      });
    } finally {
      setIsRestoring(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>バックアップと復元</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              ノートとデータベースをバックアップして、データを保護します。
            </p>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleCreateBackup}
              disabled={isCreating}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isCreating ? 'バックアップ中...' : 'バックアップを作成'}
            </Button>

            <Button
              onClick={handleSelectBackupFile}
              disabled={isRestoring}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              バックアップから復元
            </Button>
          </div>

          <div className="mt-4 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-500">
                  バックアップについて
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>バックアップには全てのノートとデータベースが含まれます</li>
                  <li>定期的にバックアップを取ることをお勧めします</li>
                  <li>
                    バックアップから復元すると、現在のデータは上書きされます
                  </li>
                  <li>
                    復元後は、アプリケーションを手動で再起動してください
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>バックアップから復元</DialogTitle>
            <DialogDescription>
              選択したバックアップから復元しますか？現在のデータは上書きされます。
            </DialogDescription>
          </DialogHeader>

          {backupMetadata && (
            <div className="space-y-2 rounded-lg border p-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-muted-foreground">バージョン:</div>
                <div>{backupMetadata.version}</div>

                <div className="text-muted-foreground">作成日時:</div>
                <div>
                  {new Date(backupMetadata.created_at).toLocaleString('ja-JP')}
                </div>

                <div className="text-muted-foreground">ノート数:</div>
                <div>{backupMetadata.notes_count}</div>

                <div className="text-muted-foreground">フォルダ数:</div>
                <div>{backupMetadata.folders_count}</div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestoreDialogOpen(false)}
              disabled={isRestoring}
            >
              キャンセル
            </Button>
            <Button onClick={handleRestoreBackup} disabled={isRestoring}>
              {isRestoring ? '復元中...' : '復元'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
