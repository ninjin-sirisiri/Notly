import { AutoBackupSettings } from './AutoBackupSettings';
import { BackupSettings } from './BackupSettings';
import GoalSettings from './GoalSettings';
import { HotkeySettings } from './HotkeySettings';
import { NotificationSettings } from './NotificationSettings';

export function SettingsPage() {
  return (
    <div className="w-full h-full overflow-auto">
      <div className="mx-auto max-w-4xl space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold">設定</h1>
          <p className="mt-2 text-muted-foreground">アプリケーションの設定を管理します</p>
        </div>

        <GoalSettings />
        <NotificationSettings />
        <HotkeySettings />
        <BackupSettings />
        <AutoBackupSettings />
      </div>
    </div>
  );
}
