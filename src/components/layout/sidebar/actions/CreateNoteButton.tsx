import { FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function CreateNoteButton({
  onClick,
  disabled
}: {
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <Button
      variant="secondary"
      onClick={onClick}
      disabled={disabled}>
      <FileText className="h-4 w-4" />
      ノート
    </Button>
  );
}
