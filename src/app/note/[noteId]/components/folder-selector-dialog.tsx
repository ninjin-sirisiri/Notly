'use client';

import { useState } from 'react';
import { Folder as FolderIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFolders } from '@/hooks/useFolders';
import { cn } from '@/lib/utils';
import type { FolderTree } from '@/types/api';

interface FolderSelectorDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolder: (folderId: string | undefined) => void;
  currentSelectedFolderId?: string | null;
}
interface SelectableFolderItemProps {
  folder: FolderTree;
  level: number;
  onSelect: (folderId: string) => void;
  selectedFolderId: string | undefined;
}

const SelectableFolderItem: React.FC<SelectableFolderItemProps> = ({
  folder,
  level,
  onSelect,
  selectedFolderId,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const paddingLeft = `${level * 16}px`;

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleSelectFolder = () => {
    onSelect(folder.id);
  };

  return (
    <div>
      <div
        className={cn(
          'flex items-center group hover:bg-gray-200 rounded px-2 py-1',
          selectedFolderId === folder.id && 'bg-gray-200'
        )}
        style={{ paddingLeft }}
      >
        <div className="flex items-center gap-1 flex-1">
          <div
            className="h-6 w-6 flex items-center justify-center cursor-pointer"
            onClick={handleToggleExpand}
          >
            {isExpanded ? <FolderIcon className="h-4 w-4" /> : <FolderIcon className="h-4 w-4" />}
          </div>
          <span className="text-sm flex-1 cursor-pointer" onClick={handleSelectFolder}>
            {folder.name}
          </span>
          <Checkbox checked={selectedFolderId === folder.id} onCheckedChange={handleSelectFolder} />
        </div>
      </div>

      {isExpanded && (
        <div className="ml-4">
          {folder.children.map((child) => (
            <SelectableFolderItem
              key={child.id}
              folder={child}
              level={level + 1}
              onSelect={onSelect}
              selectedFolderId={selectedFolderId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FolderSelectorDialog: React.FC<FolderSelectorDialogProps> = ({
  isOpen,
  onClose,
  onSelectFolder,
  currentSelectedFolderId,
}) => {
  const { folders } = useFolders();
  const [selectedFolder, setSelectedFolder] = useState<string | undefined>(
    currentSelectedFolderId ?? undefined
  );

  const handleSelect = (folderId: string | undefined) => {
    setSelectedFolder(folderId);
  };

  const handleConfirm = () => {
    onSelectFolder(selectedFolder);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>ノートの保存場所を選択</DialogTitle>
          <DialogDescription>ノートを保存するフォルダを選択してください。</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <ScrollArea className="h-64 w-full rounded-md border">
            <div
              className={cn(
                'flex items-center group hover:bg-gray-200 rounded px-4 py-2',
                selectedFolder === undefined && 'bg-gray-200'
              )}
            >
              <div
                className="flex items-center flex-1 cursor-pointer"
                onClick={() => handleSelect(undefined)}
              >
                <FolderIcon className="h-4 w-4 mr-2" />
                <span className="text-sm">ルートに保存</span>
              </div>
              <Checkbox
                checked={selectedFolder === undefined}
                onCheckedChange={() => handleSelect(undefined)}
              />
            </div>
            {folders.map((folder) => (
              <SelectableFolderItem
                key={folder.id}
                folder={folder}
                level={0}
                onSelect={handleSelect}
                selectedFolderId={selectedFolder}
              />
            ))}
          </ScrollArea>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={handleConfirm}>選択</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
