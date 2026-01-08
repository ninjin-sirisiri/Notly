import { Download, Edit2, FolderInput, Info, Trash2 } from 'lucide-react';

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger
} from '@/components/ui/context-menu';
import { useTranslation } from '@/hooks/useTranslation';

type NoteItemContextMenuProps = {
  children: React.ReactNode;
  onRename: () => void;
  onMove: () => void;
  onDelete: () => void;
  onExport: (format: 'md' | 'html' | 'pdf') => void;
  onInfo: () => void;
};

export function NoteItemContextMenu({
  children,
  onRename,
  onMove,
  onDelete,
  onExport,
  onInfo
}: NoteItemContextMenuProps) {
  const { t } = useTranslation();

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onRename}>
          <Edit2 className="mr-2 h-4 w-4" />
          {t('contextMenu.rename')}
        </ContextMenuItem>
        <ContextMenuItem onClick={onMove}>
          <FolderInput className="mr-2 h-4 w-4" />
          {t('contextMenu.move')}
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Download className="mr-2 h-4 w-4" />
            {t('contextMenu.export')}
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem onClick={() => onExport('md')}>Markdown (.md)</ContextMenuItem>
            <ContextMenuItem onClick={() => onExport('html')}>HTML (.html)</ContextMenuItem>
            <ContextMenuItem onClick={() => onExport('pdf')}>PDF (.pdf)</ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onInfo}>
          <Info className="mr-2 h-4 w-4" />
          {t('contextMenu.details')}
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={onDelete}
          className="text-red-600 focus:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          {t('actions.delete')}
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
