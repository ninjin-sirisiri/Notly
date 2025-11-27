import { Edit2, FolderInput, Palette, Settings2, Trash2 } from 'lucide-react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@/components/ui/context-menu';

type FolderItemContextMenuProps = {
  children: React.ReactNode;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
  onIconChange: () => void;
  onColorChange: () => void;
};

export function FolderItemContextMenu({
  children,
  onRename,
  onMove,
  onDelete,
  onIconChange,
  onColorChange
}: FolderItemContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem
          onClick={e => {
            e.stopPropagation();
            onRename();
          }}>
          <Edit2 className="mr-2 h-4 w-4" />
          名前を変更
        </ContextMenuItem>
        <ContextMenuItem
          onClick={e => {
            e.stopPropagation();
            onMove();
          }}>
          <FolderInput className="mr-2 h-4 w-4" />
          移動
        </ContextMenuItem>
        <ContextMenuItem
          onClick={e => {
            e.stopPropagation();
            onIconChange();
          }}>
          <Settings2 className="mr-2 h-4 w-4" />
          アイコン変更
        </ContextMenuItem>
        <ContextMenuItem
          onClick={e => {
            e.stopPropagation();
            onColorChange();
          }}>
          <Palette className="mr-2 h-4 w-4" />
          色変更
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-600 focus:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          削除
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
