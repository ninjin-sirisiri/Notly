import { FolderPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function CreateFolderButton() {
  return (
    <Button variant="secondary">
      <FolderPlus className="h-4 w-4" />
      フォルダ
    </Button>
  );
}
