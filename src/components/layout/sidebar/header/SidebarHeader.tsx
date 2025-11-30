import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Calendar,
  Check,
  CheckCheck,
  CheckSquare,
  ChevronsDown,
  ChevronsUp,
  Clock,
  FileText,
  FileUp,
  MoreHorizontal,
  Tags,
  Trash2,
  Type
} from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useFileStore } from '@/stores/files';
import { useFolderStore } from '@/stores/folders';

import { ImportNotesDialog } from '@/components/dialogs/ImportNotesDialog';
import { CreateFolderButton } from '../actions/CreateFolderButton';
import { CreateNoteButton } from '../actions/CreateNoteButton';
import { FileSearch } from './FileSearch';

type SidebarHeaderProps = {
  selectionMode: boolean;
  toggleSelectionMode: () => void;
  handleSelectAll: () => void;
  isNoteCreating: boolean;
  isCreatingNote: boolean;
  setIsCreatingNote: (value: boolean) => void;
  isFolderCreating: boolean;
  isCreatingFolder: boolean;
  setIsCreatingFolder: (value: boolean) => void;
  showTrash: boolean;
  setShowTrash: (show: boolean) => void;
  showTags: boolean;
  setShowTags: (show: boolean) => void;
  showTemplateManager: boolean;
  setShowTemplateManager: (show: boolean) => void;
  setShowTemplateSelect: (show: boolean) => void;
};

export function SidebarHeader({
  selectionMode,
  toggleSelectionMode,
  handleSelectAll,
  isNoteCreating,
  isCreatingNote,
  setIsCreatingNote,
  isFolderCreating,
  isCreatingFolder,
  setIsCreatingFolder,
  showTrash,
  setShowTrash,
  showTags,
  setShowTags,
  showTemplateManager,
  setShowTemplateManager,
  setShowTemplateSelect
}: SidebarHeaderProps) {
  const { sortBy, sortOrder, setSortBy, setSortOrder } = useFileStore();
  const [showImportDialog, setShowImportDialog] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <FileSearch />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="min-w-[200px]">
            <DropdownMenuCheckboxItem
              checked={selectionMode}
              onCheckedChange={checked => {
                if (checked) {
                  setShowTrash(false);
                  setShowTags(false);
                }
                toggleSelectionMode();
              }}
              className="justify-start">
              <CheckSquare className="mr-2 h-4 w-4" />
              選択モード
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => useFolderStore.getState().expandAllFolders()}>
              <ChevronsDown className="mr-2 h-4 w-4" />
              すべて展開
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => useFolderStore.getState().collapseAllFolders()}>
              <ChevronsUp className="mr-2 h-4 w-4" />
              すべて折りたたむ
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="pl-8">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                並び替え
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  <Type className="mr-2 h-4 w-4" />
                  <span>名前</span>
                  {sortBy === 'name' && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('createdAt')}>
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>作成日</span>
                  {sortBy === 'createdAt' && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('updatedAt')}>
                  <Clock className="mr-2 h-4 w-4" />
                  <span>更新日</span>
                  {sortBy === 'updatedAt' && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setSortOrder('asc')}>
                  <ArrowUp className="mr-2 h-4 w-4" />
                  <span>昇順</span>
                  {sortOrder === 'asc' && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder('desc')}>
                  <ArrowDown className="mr-2 h-4 w-4" />
                  <span>降順</span>
                  {sortOrder === 'desc' && <Check className="ml-auto h-4 w-4" />}
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={showTrash}
              onCheckedChange={checked => {
                if (checked) {
                  if (selectionMode) toggleSelectionMode();
                  setShowTags(false);
                }
                setShowTrash(checked);
              }}
              className="justify-start">
              <Trash2 className="mr-2 h-4 w-4" />
              ゴミ箱
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={showTags}
              onCheckedChange={checked => {
                if (checked) {
                  if (selectionMode) toggleSelectionMode();
                  setShowTrash(false);
                }
                setShowTags(checked);
              }}
              className="justify-start">
              <Tags className="mr-2 h-4 w-4" />
              タグ一覧
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowTemplateManager(!showTemplateManager)}
              className="pl-8">
              <FileText className="mr-2 h-4 w-4" />
              テンプレート管理
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => setShowImportDialog(true)}
              className="pl-8">
              <FileUp className="mr-2 h-4 w-4" />
              ノートをインポート
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ImportNotesDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
      />
      <div className="px-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          {!selectionMode && (
            <>
              <CreateNoteButton
                onClick={() => setIsCreatingNote(true)}
                disabled={isNoteCreating || isCreatingNote}
                onTemplateSelect={() => setShowTemplateSelect(true)}
              />
              <CreateFolderButton
                onClick={() => setIsCreatingFolder(true)}
                disabled={isFolderCreating || isCreatingFolder}
              />
            </>
          )}
          {selectionMode && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSelectAll}
              title="全選択">
              <CheckCheck className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
