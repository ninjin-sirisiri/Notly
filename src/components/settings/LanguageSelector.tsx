import { useTranslation } from 'react-i18next';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { changeLanguage, getCurrentLanguage } from '@/lib/i18n';

type Language = {
  code: string;
  name: string;
  nativeName: string;
};

const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語' }
];

export function LanguageSelector() {
  const { t } = useTranslation('settings');
  const currentLanguage = getCurrentLanguage();

  async function handleLanguageChange(value: string) {
    await changeLanguage(value);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4">{t('language.title')}</h3>
        <p className="text-sm text-muted-foreground mb-6">{t('language.description')}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="language-select">{t('language.title')}</Label>
        <Select
          value={currentLanguage}
          onValueChange={handleLanguageChange}>
          <SelectTrigger
            id="language-select"
            className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LANGUAGES.map(lang => (
              <SelectItem
                key={lang.code}
                value={lang.code}>
                {lang.nativeName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
