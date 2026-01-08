import { ArrowUpDown, Edit2, FolderInput, Palette, Settings2, Trash2 } from 'lucide-react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger
} from '@/components/ui/context-menu';
import { useTranslation } from '@/hooks/useTranslation';

type FolderItemContextMenuProps = {
  children: React.ReactNode;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
  onIconChange: () => void;
  onColorChange: () => void;
  onSortSettings: () => void;
};

export function FolderItemContextMenu({
  children,
  onRename,
  onMove,
  onDelete,
  onIconChange,
  onColorChange,
  onSortSettings
}: FolderItemContextMenuProps) {
  const { t } = useTranslation();

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
          {t('contextMenu.rename')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={e => {
            e.stopPropagation();
            onMove();
          }}>
          <FolderInput className="mr-2 h-4 w-4" />
          {t('contextMenu.move')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={e => {
            e.stopPropagation();
            onIconChange();
          }}>
          <Settings2 className="mr-2 h-4 w-4" />
          {t('contextMenu.changeIcon')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={e => {
            e.stopPropagation();
            onColorChange();
          }}>
          <Palette className="mr-2 h-4 w-4" />
          {t('contextMenu.changeColor')}
        </ContextMenuItem>
        <ContextMenuItem
          onClick={e => {
            e.stopPropagation();
            onSortSettings();
          }}>
          <ArrowUpDown className="mr-2 h-4 w-4" />
          {t('contextMenu.sortSettings')}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={e => {
            e.stopPropagation();
            onDelete();
          }}
          className="text-red-600 focus:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('actions.delete')}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
