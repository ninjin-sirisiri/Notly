import { useTranslation } from '@/hooks/useTranslation';
import { AutoBackupSettings } from './AutoBackupSettings';
import { BackupSettings } from './BackupSettings';
import GoalSettings from './GoalSettings';
import { HotkeySettings } from './HotkeySettings';
import { LanguageSelector } from './LanguageSelector';
import { NotificationSettings } from './NotificationSettings';

export function SettingsPage() {
  const { t } = useTranslation('settings');

  return (
    <div className="w-full h-full overflow-auto">
      <div className="mx-auto max-w-4xl space-y-8 p-8">
        <div>
          <h1 className="text-3xl font-bold">{t('title')}</h1>
          <p className="mt-2 text-muted-foreground">{t('description')}</p>
        </div>

        <LanguageSelector />
        <GoalSettings />
        <NotificationSettings />
        <HotkeySettings />
        <BackupSettings />
        <AutoBackupSettings />
      </div>
    </div>
  );
}
