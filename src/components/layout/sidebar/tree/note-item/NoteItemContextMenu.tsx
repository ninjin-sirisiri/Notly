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
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={onRename}>
          <Edit2 className="mr-2 h-4 w-4" />
          名前を変更
        </ContextMenuItem>
        <ContextMenuItem onClick={onMove}>
          <FolderInput className="mr-2 h-4 w-4" />
          移動
        </ContextMenuItem>
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Download className="mr-2 h-4 w-4" />
            エクスポート
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
          詳細
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem
          onClick={onDelete}
          className="text-red-600 focus:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          削除
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}
