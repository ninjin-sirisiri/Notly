import { Button } from '@/components/ui/button';
import { FolderPlus } from 'lucide-react';

export function CreateFolderButton() {
  return (
    <Button variant="secondary">
      <FolderPlus className="h-4 w-4" />
      フォルダ
    </Button>
  );
}
