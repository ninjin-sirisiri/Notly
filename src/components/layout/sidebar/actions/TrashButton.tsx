import { Trash2 } from 'lucide-react';
import { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { useTrashStore } from '@/stores/trash';

export function TrashButton({ onClick }: { onClick: () => void }) {
  const { deletedNotes, deletedFolders, loadDeletedItems } = useTrashStore();

  useEffect(() => {
    loadDeletedItems();
  }, [loadDeletedItems]);

  const totalDeletedItems = deletedNotes.length + deletedFolders.length;

  return (
    <Button
      className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
      onClick={onClick}
      size="sm"
      variant="ghost">
      <Trash2 className="h-4 w-4" />
      <span>ゴミ箱</span>
      {totalDeletedItems > 0 && (
        <span className="ml-auto text-xs text-muted-foreground">({totalDeletedItems})</span>
      )}
    </Button>
  );
}
