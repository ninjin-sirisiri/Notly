import { ChevronRight, Edit2, Folder, FolderInput, Heart, MoreHorizontal, Palette, Settings2, Trash2, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useDraggable, useDroppable } from '@dnd-kit/core';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { useDeleteFolder, useMoveFolder, useUpdateFolder } from '@/hooks/useFolder';
import { cn, getContrastColor } from '@/lib/utils';
import { useFolderStore } from '@/stores/folders';
import { useSelectionStore } from '@/stores/selection';
import { type FileItem as FileItemType, type FolderWithChildren } from '@/types/files';

import { FolderItemContextMenu } from './folder-item/FolderItemContextMenu';
import { FolderItemDeleteDialog } from './folder-item/FolderItemDeleteDialog';
import { FolderItemMoveMenu } from './folder-item/FolderItemMoveMenu';
import { getAllDescendants } from './folder-item/utils';

// lucide-reactアイコンと文字列のマッピング
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  folder: Folder,
  heart: Heart,
  user: User,
  // 必要に応じて他のアイコンも追加
  // ... etc.
};

type FolderItemProps = {
  folder: FolderWithChildren;
  isActive?: boolean;
  FileItemComponent: React.ComponentType<{ item: FileItemType }>;
  onClick: () => void;
};

export function FolderItem({ folder, isActive, FileItemComponent, onClick }: FolderItemProps) {
  const { openFolderIds, toggleFolder } = useFolderStore();
  const isOpen = openFolderIds.includes(folder.id);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(folder.name);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showIconDialog, setShowIconDialog] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(folder.color || '#ffffff'); // folder.colorがundefinedの場合のデフォルト値
  const { updateFolder } = useUpdateFolder();
  const { deleteFolder } = useDeleteFolder();
  const { moveFolder } = useMoveFolder();

  const { selectionMode, isSelected, toggleSelectionWithChildren } = useSelectionStore();
  const selected = isSelected(folder.id, 'folder');

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: folder.id
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    isDragging
  } = useDraggable({
    id: `folder-${folder.id}`,
    disabled: isEditing || selectionMode
  });

  useEffect(() => {
    setName(folder.name);
    setSelectedColor(folder.color || '#ffffff'); // folder.colorが変更されたらstateも更新
  }, [folder.name, folder.color]);

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
    if (selectionMode) {
      // 選択モード時は選択/選択解除
      const allItems = getAllDescendants(folder);
      toggleSelectionWithChildren(allItems);
    } else {
      // 通常モード時はフォルダを開閉
      toggleFolder(folder.id);
      onClick();
    }
  }

  function handleToggleFolder(e: React.MouseEvent) {
    e.stopPropagation();
    // 選択モードでもフォルダの開閉を可能にする
    toggleFolder(folder.id);
    if (!selectionMode) {
      onClick();
    }
  }

  function handleSave() {
    if (name.trim() === '') {
      setIsEditing(false);
      setName(folder.name);
    } else {
      updateFolder(folder.id, name, folder.folderPath, folder.parentId, folder.icon);
      setIsEditing(false);
    }
  }

  function confirmDelete() {
    deleteFolder(folder.id);
    setShowDeleteConfirm(false);
  }

  function handleMoveToFolder(parentId: number | null) {
    moveFolder(folder.id, parentId);
    setShowMoveMenu(false);
  }

  const handleIconChange = () => {
    setShowIconDialog(true);
  };

  const handleColorChange = () => {
    setShowColorPicker(true);
  };

  const confirmIconChange = (icon: string) => {
    updateFolder(folder.id, folder.name, folder.folderPath, folder.parentId, icon, folder.color);
    setShowIconDialog(false);
  };

  const confirmColorChange = () => {
    updateFolder(folder.id, folder.name, folder.folderPath, folder.parentId, folder.icon, selectedColor);
    setShowColorPicker(false);
  };

  const IconComponent = ({ iconColor }: { iconColor: string }) => {
    if (folder.icon && folder.icon.startsWith('data:image/')) {
      // 画像URLの場合
      return <img src={folder.icon} className="h-4 w-4" alt="Folder Icon" style={{ color: iconColor }} />;
    } else if (folder.icon && iconMap[folder.icon]) {
      // iconMapに登録されたアイコンの場合
      const Icon = iconMap[folder.icon];
      return <Icon className="h-4 w-4" style={{ color: iconColor }} />;
    } else {
      // デフォルトのFolderアイコン
      return <Folder className="h-4 w-4" style={{ color: iconColor }} />;
    }
  };

  const iconColor = folder.color ? getContrastColor(folder.color) : '#000000'; // フォルダの色がある場合はコントラスト色を、ない場合は黒を使用

  return (
    <div>
      {isEditing ? (
        <div className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded text-primary dark:text-white group relative">
          <ChevronRight
            className={cn(
              'h-4 w-4 transform transition-transform cursor-pointer',
              isOpen && 'rotate-90'
            )}
            onClick={handleToggleFolder}
          />
          <Folder className="h-4 w-4" />
          <input
            autoFocus
            value={name}
            onBlur={handleSave}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                handleSave();
              }
              if (e.key === 'Escape') {
                setIsEditing(false);
                setName(folder.name);
              }
            }}
            className="w-full bg-transparent outline-none"
          />
        </div>
      ) : (
        <FolderItemContextMenu
          onRename={() => setIsEditing(true)}
          onMove={() => setShowMoveMenu(true)}
          onDelete={() => setShowDeleteConfirm(true)}
          onIconChange={handleIconChange}
          onColorChange={handleColorChange}>
          <div
            ref={node => {
              setDroppableRef(node);
              setDraggableRef(node);
            }}
            {...attributes}
            {...listeners}
            className={cn(
              'flex items-center gap-2 pl-2 pr-2 py-1.5 rounded text-primary dark:text-white group relative cursor-pointer',
              isActive
                ? 'bg-gray-200 dark:bg-gray-700'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700/50',
              isOver && 'bg-blue-100 dark:bg-blue-900/30',
              isDragging && 'opacity-50',
              selected && 'bg-blue-100 dark:bg-blue-900/30'
            )}
            onClick={handleClick}>
            {selectionMode && (
              <Checkbox
                checked={selected}
                onCheckedChange={() => {
                  const allItems = getAllDescendants(folder);
                  toggleSelectionWithChildren(allItems);
                }}
                onClick={e => e.stopPropagation()}
                className="mr-1"
              />
            )}
            <ChevronRight
              className={cn(
                'h-4 w-4 transform transition-transform cursor-pointer',
                isOpen && 'rotate-90'
              )}
              onClick={handleToggleFolder}
            />
            <span className="rounded-full p-1" style={{ backgroundColor: folder.color ? folder.color : undefined }}>
              <IconComponent iconColor={iconColor} />
            </span>
            <p className="text-sm font-medium flex-1 truncate">{folder.name}</p>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                    onClick={e => e.stopPropagation()}>
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="mr-2 h-4 w-4" />
                    名前を変更
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowMoveMenu(true)}>
                    <FolderInput className="mr-2 h-4 w-4" />
                    移動
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleIconChange}>
                    <Settings2 className="mr-2 h-4 w-4" />
                    アイコン変更
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleColorChange}>
                    <Palette className="mr-2 h-4 w-4" />
                    色変更
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => setShowDeleteConfirm(true)}
                    className="text-destructive focus:text-destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    削除
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </FolderItemContextMenu>
      )}
      {showMoveMenu && (
        <FolderItemMoveMenu
          currentFolderId={folder.id}
          onMove={handleMoveToFolder}
        />
      )}
      {/* アイコン選択ダイアログ */}
      <Dialog open={showIconDialog} onOpenChange={setShowIconDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>アイコンを選択</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-6 gap-2">
            {Object.entries(iconMap).map(([iconKey, IconComponent]) => (
              <Button
                key={iconKey}
                variant={folder.icon === iconKey ? 'default' : 'outline'}
                size="sm"
                onClick={() => confirmIconChange(iconKey)}
                className="p-2">
                <IconComponent className="h-4 w-4" />
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
      {/* カラーピッカー */}
      <Dialog open={showColorPicker} onOpenChange={setShowColorPicker}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>色を選択</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            <Input
              type="color"
              value={selectedColor}
              onChange={e => setSelectedColor(e.target.value)}
              className="h-10 w-10 p-1 cursor-pointer"
            />
            <Button onClick={confirmColorChange}>適用</Button>
          </div>
        </DialogContent>
      </Dialog>
      {isOpen && folder.children && folder.children.length > 0 && (
        <div className="pl-4 relative">
          <div className="space-y-0.5 relative">
            {folder.children.map(item => (
              <FileItemComponent
                key={'folder' in item ? `folder-${item.folder.id}` : `note-${item.note.id}`}
                item={item}
              />
            ))}
          </div>
        </div>
      )}

      <FolderItemDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        folderName={folder.name}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
