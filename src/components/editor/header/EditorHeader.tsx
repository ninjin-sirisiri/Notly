import { Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/useTranslation';
import { formatDateTime } from '@/lib/dateFormat';

type Props = {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  handleSave: () => void;
  created_at: Date;
  isLoading: boolean;
  isNewNote: boolean;
};

export function EditorHeader({
  title,
  setTitle,
  handleSave,
  created_at,
  isLoading,
  isNewNote
}: Props) {
  const { t } = useTranslation('editor');

  return (
    <div className="flex items-center sm:justify-between gap-2 p-2">
      <input
        className="w-full text-2xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-foreground p-0.5 bg-transparent border-none focus:outline-none"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onBlur={() => {
          if (!isNewNote) {
            handleSave();
          }
        }}
      />
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleSave}
          disabled={isLoading}>
          <Save />
          {isLoading ? (
            <>
              <Spinner />
              <span>{t('header.saving')}</span>
            </>
          ) : (
            <span>{t('header.save')}</span>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">{formatDateTime(created_at)}</span>
      </div>
    </div>
  );
}
