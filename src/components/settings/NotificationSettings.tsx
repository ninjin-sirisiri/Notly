import { Bell, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useTranslation } from '@/hooks/useTranslation';
import { useNotificationStore } from '../../stores/notification';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function NotificationSettings() {
  const { t } = useTranslation('settings');
  const { settings, isLoading, loadSettings, updateSettings } = useNotificationStore();

  const [enabled, setEnabled] = useState(true);
  const [notificationTime, setNotificationTime] = useState('09:00');
  const [message, setMessage] = useState('ノートを書く時間です!');

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (settings) {
      setEnabled(settings.enabled);
      setNotificationTime(settings.notification_time);
      setMessage(settings.message);
    }
  }, [settings]);

  async function handleSave() {
    try {
      await updateSettings({
        enabled,
        notification_time: notificationTime,
        message
      });
      toast.success(t('notifications.saveSuccess'));
    } catch {
      toast.error(t('notifications.saveError'));
    }
  }

  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">{t('notifications.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Bell className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{t('notifications.title')}</h2>
          <p className="text-sm text-muted-foreground">{t('notifications.description')}</p>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label
              htmlFor="notification-enabled"
              className="text-base">
              {t('notifications.enable')}
            </Label>
            <p className="text-sm text-muted-foreground">{t('notifications.enableDescription')}</p>
          </div>
          <Switch
            id="notification-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification-time">{t('notifications.time')}</Label>
          <Input
            id="notification-time"
            type="time"
            value={notificationTime}
            onChange={e => setNotificationTime(e.target.value)}
            disabled={!enabled}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">{t('notifications.timeHelp')}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification-message">{t('notifications.message')}</Label>
          <Textarea
            id="notification-message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={!enabled}
            placeholder={t('notifications.messagePlaceholder')}
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground">{t('notifications.messageHelp')}</p>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            {t('notifications.save')}
          </Button>
        </div>
      </div>
    </div>
  );
}
