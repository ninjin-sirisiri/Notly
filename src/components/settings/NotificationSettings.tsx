import { Bell, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useNotificationStore } from '../../stores/notification';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

export function NotificationSettings() {
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
      toast.success('通知設定を保存しました');
    } catch {
      toast.error('通知設定の保存に失敗しました');
    }
  }

  if (isLoading && !settings) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">読み込み中...</div>
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
          <h2 className="text-xl font-semibold">通知設定</h2>
          <p className="text-sm text-muted-foreground">
            毎日決まった時間に通知を受け取ることができます
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label
              htmlFor="notification-enabled"
              className="text-base">
              通知を有効にする
            </Label>
            <p className="text-sm text-muted-foreground">設定した時間に通知を送信します</p>
          </div>
          <Switch
            id="notification-enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification-time">通知時間</Label>
          <Input
            id="notification-time"
            type="time"
            value={notificationTime}
            onChange={e => setNotificationTime(e.target.value)}
            disabled={!enabled}
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">毎日この時間に通知を送信します</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notification-message">通知メッセージ</Label>
          <Textarea
            id="notification-message"
            value={message}
            onChange={e => setMessage(e.target.value)}
            disabled={!enabled}
            placeholder="通知に表示するメッセージを入力"
            className="min-h-[100px] resize-none"
          />
          <p className="text-xs text-muted-foreground">
            通知に表示されるメッセージをカスタマイズできます
          </p>
        </div>

        <div className="flex justify-end pt-4">
          <Button
            onClick={handleSave}
            disabled={isLoading}>
            <Save className="mr-2 h-4 w-4" />
            保存
          </Button>
        </div>
      </div>
    </div>
  );
}
