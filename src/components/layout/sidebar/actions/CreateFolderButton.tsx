import { FolderPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';

export function CreateFolderButton({
  onClick,
  disabled
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  const { t } = useTranslation();

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onClick}
      disabled={disabled}>
      <FolderPlus className="h-4 w-4" />
      {t('actions.newFolder')}
    </Button>
  );
}
