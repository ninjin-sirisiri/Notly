import { FolderPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function CreateFolderButton({
  onClick,
  disabled
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={onClick}
      disabled={disabled}>
      <FolderPlus className="h-4 w-4" />
      フォルダ
    </Button>
  );
}
