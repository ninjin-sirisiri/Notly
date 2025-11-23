import { RotateCcw, Trash2, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

type TrashHeaderProps = {
  selectedCount: number;
  totalItems: number;
  onRestoreSelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
  onRestoreAll: () => void;
  onEmptyTrash: () => void;
};

export function TrashHeader({
  selectedCount,
  totalItems,
  onRestoreSelected,
  onDeleteSelected,
  onClearSelection,
  onRestoreAll,
  onEmptyTrash
}: TrashHeaderProps) {
  return (
    <div className="border-b p-4 space-y-3">
      <div>
        <h1 className="text-xl font-bold">ゴミ箱</h1>
        <p className="text-xs text-muted-foreground">
          {selectedCount > 0 ? `${selectedCount}個選択中` : `${totalItems}個のアイテム`}
        </p>
      </div>

      {selectedCount > 0 ? (
        <div className="flex flex-col gap-2">
          <Button
            onClick={onRestoreSelected}
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs justify-start">
            <RotateCcw className="mr-2 h-3 w-3" />
            選択した項目を元に戻す
          </Button>
          <Button
            onClick={onDeleteSelected}
            size="sm"
            variant="destructive"
            className="w-full h-8 text-xs justify-start">
            <Trash2 className="mr-2 h-3 w-3" />
            選択した項目を削除
          </Button>
          <Button
            onClick={onClearSelection}
            size="sm"
            variant="ghost"
            className="w-full h-8 text-xs justify-start">
            <X className="mr-2 h-3 w-3" />
            選択解除
          </Button>
        </div>
      ) : (
        totalItems > 0 && (
          <div className="flex flex-col gap-2">
            <Button
              onClick={onRestoreAll}
              size="sm"
              variant="outline"
              className="w-full h-8 text-xs justify-start">
              <RotateCcw className="mr-2 h-3 w-3" />
              すべて元に戻す
            </Button>
            <Button
              onClick={onEmptyTrash}
              size="sm"
              variant="destructive"
              className="w-full h-8 text-xs justify-start">
              <Trash2 className="mr-2 h-3 w-3" />
              ゴミ箱を空にする
            </Button>
          </div>
        )
      )}
    </div>
  );
}
