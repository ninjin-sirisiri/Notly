import { Keyboard, Pencil, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useHotkeyStore } from '../../stores/hotkeys';
import { HOTKEY_ACTION_LABELS } from '../../types/hotkeys';

function parseHotkey(shortcut: string): string[] {
  // プラットフォームを検出
  const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

  // CommandOrControl をプラットフォームに応じて変換
  let normalized = shortcut.replaceAll('CommandOrControl', isMac ? 'Cmd' : 'Ctrl');
  normalized = normalized.replaceAll('Command', 'Cmd');

  // macOSの場合、Altを⌥（Option）に変換
  if (isMac) {
    normalized = normalized.replaceAll('Alt', '⌥');
  }

  // + で分割
  return normalized.split('+').map(key => key.trim());
}

// キーコードを Tauri のキー名にマッピング
function mapKeyToTauriFormat(key: string): string {
  const keyMap: Record<string, string> = {
    ' ': 'Space',
    ArrowUp: 'Up',
    ArrowDown: 'Down',
    ArrowLeft: 'Left',
    ArrowRight: 'Right',
    Escape: 'Escape',
    Enter: 'Return',
    Backspace: 'Backspace',
    Delete: 'Delete',
    Tab: 'Tab',
    Insert: 'Insert',
    Home: 'Home',
    End: 'End',
    PageUp: 'PageUp',
    PageDown: 'PageDown'
  };

  return keyMap[key] || key.toUpperCase();
}

export function HotkeySettings() {
  const { hotkeys, isLoading, loadHotkeys, updateHotkey } = useHotkeyStore();
  const [editingHotkeys, setEditingHotkeys] = useState<
    Record<string, { shortcut: string; enabled: boolean }>
  >({});
  const [editingAction, setEditingAction] = useState<string | null>(null);
  const [recordingKeys, setRecordingKeys] = useState<string[]>([]);

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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, action: string) {
    e.preventDefault();
    e.stopPropagation();

    // Escape キーで録音をキャンセル
    if (e.key === 'Escape') {
      setRecordingKeys([]);
      return;
    }

    // 修飾キーのみの場合は無視
    if (['Control', 'Shift', 'Alt', 'Meta'].includes(e.key)) {
      return;
    }

    const keys: string[] = [];

    // 修飾キーを追加
    if (e.ctrlKey || e.metaKey) {
      keys.push('CommandOrControl');
    }
    if (e.shiftKey) {
      keys.push('Shift');
    }
    if (e.altKey) {
      keys.push('Alt');
    }

    // メインキーを追加
    const mainKey = mapKeyToTauriFormat(e.key);
    keys.push(mainKey);

    // ショートカット文字列を生成
    const shortcut = keys.join('+');

    // 録音中のキーを表示用に保存
    setRecordingKeys(keys);

    // ショートカットを更新
    handleChange(action, 'shortcut', shortcut);
  }

  function handleKeyUp() {
    // キーが離されたら録音中の表示をクリア
    setRecordingKeys([]);
  }

  function handleInputFocus() {
    setRecordingKeys([]);
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
      setEditingAction(null);
    } catch {
      toast.error('ショートカットキーの保存に失敗しました');
    }
  }

  function handleCancel(action: string) {
    const original = hotkeys.find(h => h.action === action);
    if (original) {
      setEditingHotkeys(prev => ({
        ...prev,
        [action]: {
          shortcut: original.shortcut,
          enabled: original.enabled
        }
      }));
    }
    setEditingAction(null);
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
          const isEditing = editingAction === hotkey.action;
          const keys = parseHotkey(editing.shortcut);

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

                {isEditing ? (
                  <div className="space-y-2">
                    <Input
                      id={`hotkey-${hotkey.action}`}
                      value={
                        recordingKeys.length > 0 ? recordingKeys.join(' + ') : editing.shortcut
                      }
                      readOnly
                      onKeyDown={e => handleKeyDown(e, hotkey.action)}
                      onKeyUp={handleKeyUp}
                      onFocus={handleInputFocus}
                      disabled={!editing.enabled}
                      placeholder="キーを押してください..."
                      autoFocus
                      className="cursor-text"
                    />
                    <p className="text-xs text-muted-foreground">
                      {recordingKeys.length > 0
                        ? '録音中... キーを離すと確定されます。Escでキャンセル。'
                        : 'フィールドにフォーカスして、設定したいキーの組み合わせを押してください。Escでキャンセル。'}
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2 cursor-pointer hover:bg-muted transition-colors w-full text-left"
                    onClick={() => editing.enabled && setEditingAction(hotkey.action)}
                    disabled={!editing.enabled}
                    tabIndex={editing.enabled ? 0 : -1}>
                    <KbdGroup>
                      {keys.map(key => (
                        <Kbd key={`${hotkey.action}-${key}`}>{key}</Kbd>
                      ))}
                    </KbdGroup>
                    {editing.enabled && (
                      <Pencil className="ml-auto h-3 w-3 text-muted-foreground" />
                    )}
                  </button>
                )}
              </div>

              {isEditing ? (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleSave(hotkey.action)}
                    disabled={isLoading}
                    size="icon"
                    className="mb-0.5">
                    <Save className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleCancel(hotkey.action)}
                    disabled={isLoading}
                    size="icon"
                    variant="outline"
                    className="mb-0.5">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setEditingAction(hotkey.action)}
                  disabled={isLoading || !editing.enabled}
                  size="icon"
                  variant="ghost"
                  className="mb-0.5">
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
