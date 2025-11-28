import { Keyboard, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useHotkeyStore } from '../../stores/hotkeys';
import { HOTKEY_ACTION_LABELS } from '../../types/hotkeys';

export function HotkeySettings() {
  const { hotkeys, isLoading, loadHotkeys, updateHotkey } = useHotkeyStore();
  const [editingHotkeys, setEditingHotkeys] = useState<
    Record<string, { shortcut: string; enabled: boolean }>
  >({});

  useEffect(() => {
    loadHotkeys();
  }, [loadHotkeys]);

  useEffect(() => {
    if (hotkeys.length > 0) {
      const initialstate: Record<string, { shortcut: string; enabled: boolean }> = {};
      for (const h of hotkeys) {
        initialstate[h.action] = { shortcut: h.shortcut, enabled: h.enabled };
      }
      setEditingHotkeys(initialstate);
    }
  }, [hotkeys]);

  function handleChange(action: string, field: 'shortcut' | 'enabled', value: string | boolean) {
    setEditingHotkeys(prev => ({
      ...prev,
      [action]: {
        ...prev[action],
        [field]: value
      }
    }));
  }

  async function handleSave(action: string) {
    const current = editingHotkeys[action];
    if (!current) return;

    try {
      await updateHotkey({
        action,
        shortcut: current.shortcut,
        enabled: current.enabled
      });
      toast.success('ショートカットキーを保存しました');
    } catch {
      toast.error('ショートカットキーの保存に失敗しました');
    }
  }

  if (isLoading && hotkeys.length === 0) {
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
          <Keyboard className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">ショートカットキー設定</h2>
          <p className="text-sm text-muted-foreground">
            グローバルショートカットキーをカスタマイズできます
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-lg border bg-card p-6">
        {hotkeys.map(hotkey => {
          const editing = editingHotkeys[hotkey.action] || {
            shortcut: hotkey.shortcut,
            enabled: hotkey.enabled
          };

          return (
            <div
              key={hotkey.id}
              className="flex items-end gap-4 border-b pb-4 last:border-0 last:pb-0">
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor={`hotkey-${hotkey.action}`}
                    className="text-base">
                    {HOTKEY_ACTION_LABELS[hotkey.action] || hotkey.action}
                  </Label>
                  <Switch
                    checked={editing.enabled}
                    onCheckedChange={checked => handleChange(hotkey.action, 'enabled', checked)}
                  />
                </div>
                <Input
                  id={`hotkey-${hotkey.action}`}
                  value={editing.shortcut}
                  onChange={e => handleChange(hotkey.action, 'shortcut', e.target.value)}
                  disabled={!editing.enabled}
                  placeholder="例: CommandOrControl+Shift+N"
                />
                <p className="text-xs text-muted-foreground">
                  Tauriのショートカット形式で入力してください (例: CommandOrControl+Shift+N)
                </p>
              </div>
              <Button
                onClick={() => handleSave(hotkey.action)}
                disabled={isLoading}
                size="icon"
                className="mb-0.5">
                <Save className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
