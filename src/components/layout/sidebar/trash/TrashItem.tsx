import {
  ChevronDown,
  ChevronRight,
  FileText,
  Folder as FolderIcon,
  RotateCcw,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

import { type TrashNode } from './utils';

export function TrashItem({
  node,
  depth = 0,
  selectedItems,
  onCheck,
  onRestore,
  onDelete,
  isExpanded,
  onToggle
}: {
  node: TrashNode;
  depth?: number;
  selectedItems: Set<string>;
  onCheck: (type: 'note' | 'folder', id: number) => void;
  onRestore: (type: 'note' | 'folder', id: number) => void;
  onDelete: (type: 'note' | 'folder', id: number) => void;
  isExpanded?: boolean;
  onToggle?: () => void;
}) {
  const isFolder = node.type === 'folder';
  const hasChildren = isFolder && node.children.length > 0;
  const itemId = isFolder ? node.data.id : node.data.id;
  const isChecked = selectedItems.has(`${node.type}-${itemId}`);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (isFolder && onToggle) {
      onToggle();
    }
  }

  return (
    <div
      className="group flex items-center justify-between py-1 px-2 hover:bg-accent/50 rounded-sm cursor-default text-sm"
      style={{ paddingLeft: `${depth * 12 + 8}px` }}
      onClick={handleToggle}>
      <div className="flex items-center gap-2 overflow-hidden">
        <div onClick={e => e.stopPropagation()}>
          <Checkbox
            checked={isChecked}
            onCheckedChange={() => onCheck(node.type, itemId)}
            className="h-3.5 w-3.5"
          />
        </div>
        {isFolder && (
          <div
            className={`p-0.5 rounded-sm hover:bg-accent ${hasChildren ? '' : 'invisible'}`}
            onClick={handleToggle}>
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        )}
        {!isFolder && <div className="w-4" />} {/* Indent for notes */}
        {isFolder ? (
          <FolderIcon className="h-4 w-4 text-blue-400 shrink-0" />
        ) : (
          <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className="truncate">{isFolder ? node.data.name : node.data.title}</span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          title="元に戻す"
          onClick={e => {
            e.stopPropagation();
            onRestore(node.type, itemId);
          }}>
          <RotateCcw className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-destructive hover:text-destructive"
          title="完全に削除"
          onClick={e => {
            e.stopPropagation();
            onDelete(node.type, itemId);
          }}>
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
