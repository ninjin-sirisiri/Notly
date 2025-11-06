import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

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
      disabled={disabled}
    >
      <FileText className="h-4 w-4" />
      ノート
    </Button>
  );
}
