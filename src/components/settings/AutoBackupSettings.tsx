import { open } from '@tauri-apps/plugin-dialog';
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
import { useTranslation } from '@/hooks/useTranslation';
import {
  getBackupSettings,
  updateBackupSettings,
  type BackupSettings as BackupSettingsType
} from '@/lib/api/backup';
import { formatDateTime } from '@/lib/dateFormat';

export function AutoBackupSettings() {
  const { t } = useTranslation('settings');
  const [settings, setSettings] = useState<BackupSettingsType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  async function loadSettings() {
    try {
      const data = await getBackupSettings();
      setSettings(data);
    } catch (error) {
      toast.error(t('autoBackup.loadError'), {
        description: error instanceof Error ? error.message : t('autoBackup.loadErrorDescription')
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSelectBackupPath() {
    try {
      const selected = await open({
        title: t('autoBackup.selectPathTitle'),
        directory: true
      });

      if (selected && typeof selected === 'string' && settings) {
        setSettings({ ...settings, backup_path: selected });
      }
    } catch (error) {
      toast.error(t('autoBackup.selectError'), {
        description: error instanceof Error ? error.message : t('autoBackup.selectErrorDescription')
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
      toast.success(t('autoBackup.saveSuccess'), {
        description: t('autoBackup.saveSuccessDescription')
      });
    } catch (error) {
      toast.error(t('autoBackup.saveError'), {
        description: error instanceof Error ? error.message : t('autoBackup.saveErrorDescription')
      });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading || !settings) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('autoBackup.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('autoBackup.loading')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('autoBackup.title')}</CardTitle>
        <CardDescription>{t('autoBackup.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="auto-backup-enabled">{t('autoBackup.enable')}</Label>
            <p className="text-sm text-muted-foreground">{t('autoBackup.enableDescription')}</p>
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
              <Label htmlFor="frequency">{t('autoBackup.frequency')}</Label>
              <Select
                value={settings.frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'monthly') =>
                  setSettings({ ...settings, frequency: value })
                }>
                <SelectTrigger id="frequency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t('autoBackup.frequencyOptions.daily')}</SelectItem>
                  <SelectItem value="weekly">{t('autoBackup.frequencyOptions.weekly')}</SelectItem>
                  <SelectItem value="monthly">
                    {t('autoBackup.frequencyOptions.monthly')}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-path">{t('autoBackup.backupPath')}</Label>
              <div className="flex gap-2">
                <Input
                  id="backup-path"
                  value={settings.backup_path || ''}
                  readOnly
                  placeholder={t('autoBackup.backupPathPlaceholder')}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  onClick={handleSelectBackupPath}
                  className="shrink-0">
                  <FolderOpen className="h-4 w-4 mr-2" />
                  {t('autoBackup.browse')}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="max-backups">{t('autoBackup.maxBackups')}</Label>
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
              <p className="text-xs text-muted-foreground">{t('autoBackup.maxBackupsHelp')}</p>
            </div>

            {settings.last_backup_at && (
              <div className="rounded-lg border p-3 bg-muted/50">
                <p className="text-sm text-muted-foreground">
                  {t('autoBackup.lastBackup')} {formatDateTime(settings.last_backup_at)}
                </p>
              </div>
            )}
          </>
        )}

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full">
          {isSaving ? t('autoBackup.saving') : t('autoBackup.save')}
        </Button>
      </CardContent>
    </Card>
  );
}
