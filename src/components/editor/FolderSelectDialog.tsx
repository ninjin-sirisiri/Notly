import { Folder, FolderRoot } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/lib/utils';
import { useFolderStore } from '@/stores/folders';
import { type FolderWithChildren } from '@/types/files';

import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '../ui/dialog';

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFolder: (folderId: number | null, folderPath: string) => void;
};

export function FolderSelectDialog({ open, onOpenChange, onSelectFolder }: Props) {
  const folders = useFolderStore(state => state.folders);
  const [selectedFolderId, setSelectedFolderId] = useState<number | null>(null);

  function handleSelect() {
    const selectedFolder = folders.find(f => f.id === selectedFolderId);
    onSelectFolder(selectedFolderId, selectedFolder?.folderPath || '');
    onOpenChange(false);
  }

  // フォルダを階層構造で整理
  const rootFolders = folders.filter(f => f.parentId === null);

  function renderFolder(folder: FolderWithChildren, depth = 0) {
    const childFolders = folders.filter(f => f.parentId === folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id}>
        <button
          type="button"
          onClick={() => setSelectedFolderId(folder.id)}
          className={cn(
            'w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors text-sm',
            isSelected
              ? 'bg-accent text-accent-foreground font-medium'
              : 'hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground'
          )}
          style={{ paddingLeft: `${depth * 20 + 12}px` }}>
          <Folder size={16} />
          <span>{folder.name}</span>
        </button>
        {childFolders.map(child => renderFolder(child, depth + 1))}
      </div>
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>保存先フォルダを選択</DialogTitle>
          <DialogDescription>ノートを保存するフォルダを選択してください。</DialogDescription>
        </DialogHeader>
        <div className="py-4 max-h-[400px] overflow-y-auto">
          <div className="space-y-1">
            {/* ルートフォルダオプション */}
            <button
              type="button"
              onClick={() => setSelectedFolderId(null)}
              className={cn(
                'w-full text-left px-3 py-2 rounded-md flex items-center gap-2 transition-colors text-sm',
                selectedFolderId === null
                  ? 'bg-accent text-accent-foreground font-medium'
                  : 'hover:bg-accent/50 text-muted-foreground hover:text-accent-foreground'
              )}>
              <FolderRoot size={16} />
              <span>ルート</span>
            </button>
            {/* フォルダリスト */}
            {rootFolders.map(folder => renderFolder(folder))}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}>
            キャンセル
          </Button>
          <Button onClick={handleSelect}>選択</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
