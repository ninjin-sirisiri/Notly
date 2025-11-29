import { FolderOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  getBackupSettings,
  updateBackupSettings,
  type BackupSettings as BackupSettingsType
} from '@/lib/api/backup';
import { open } from '@tauri-apps/plugin-dialog';

export function AutoBackupSettings() {
  const [settings, setSettings] = useState<BackupSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await getBackupSettings();
      setSettings(data);
    } catch (error) {
      toast.error('設定読み込みエラー', {
        description: error instanceof Error ? error.message : '設定の読み込みに失敗しました'
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSelectBackupPath() {
    try {
      const selected = await open({
        title: '自動バックアップ保存先を選択',
        directory: true
      });

      if (selected && typeof selected === 'string' && settings) {
        setSettings({ ...settings, backup_path: selected });
      }
    } catch (error) {
      toast.error('フォルダ選択エラー', {
        description: error instanceof Error ? error.message : 'フォルダの選択に失敗しました'
      });
    }
  }

  async function handleSave() {
    if (!settings) return;

    try {
      setIsSaving(true);
      const updated = await updateBackupSettings({
        enabled: settings.enabled,
        frequency: settings.frequency,
        backup_path: settings.backup_path,
        max_backups: settings.max_backups
      });
      setSettings(updated);
      toast.success('保存完了', {
        description: '自動バックアップ設定が保存されました'
      });
    } catch (error) {
      toast.error('保存失敗', {
        description: error instanceof Error ? error.message : '設定の保存に失敗しました'
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>自動バックアップ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>自動バックアップ</CardTitle>
        <CardDescription>定期的に自動でバックアップを作成します</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-backup-enabled">自動バックアップを有効化</Label>
            <p className="text-sm text-muted-foreground">定期的に自動でバックアップを作成します</p>
          </div>
          <Switch
            id="auto-backup-enabled"
            checked={settings.enabled}
            onCheckedChange={checked => setSettings({ ...settings, enabled: checked })}
          />
        </div>

        {settings.enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="frequency">バックアップ頻度</Label>
              <Select
                value={settings.frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                  setSettings({ ...settings, frequency: value })
                }>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">毎日</SelectItem>
                  <SelectItem value="weekly">毎週</SelectItem>
                  <SelectItem value="monthly">毎月</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-path">バックアップ保存先</Label>
              <div className="flex gap-2">
                <Input
                  id="backup-path"
                  value={settings.backup_path || ''}
                  readOnly
                  placeholder="保存先を選択してください"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleSelectBackupPath}
                  className="shrink-0">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  参照
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-backups">保持するバックアップ数</Label>
              <Input
                id="max-backups"
                type="number"
                min="1"
                max="100"
                value={settings.max_backups}
                onChange={e =>
                  setSettings({
                    ...settings,
                    max_backups: Number.parseInt(e.target.value, 10) || 10
                  })
                }
              />
              <p className="text-xs text-muted-foreground">
                この数を超える古いバックアップは自動的に削除されます
              </p>
            </div>

            {settings.last_backup_at && (
              <div className="rounded-lg border p-3 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  最終バックアップ: {new Date(settings.last_backup_at).toLocaleString('ja-JP')}
                </p>
              </div>
            )}
          </>
        )}

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full">
          {isSaving ? '保存中...' : '設定を保存'}
        </Button>
      </CardContent>
    </Card>
  );
}
