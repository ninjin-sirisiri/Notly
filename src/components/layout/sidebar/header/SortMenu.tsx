import { ArrowDown, ArrowUp, ArrowUpDown, Calendar, Check, Clock, Type } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useFileStore } from '@/stores/files';

export function SortMenu() {
  const { sortBy, sortOrder, setSortBy, setSortOrder } = useFileStore();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <span className="sr-only">並び替え</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-48">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
