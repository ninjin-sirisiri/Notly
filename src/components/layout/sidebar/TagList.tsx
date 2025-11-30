import { ChevronDown, ChevronRight, Hash, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';
import { TagDialog } from '@/components/tags/TagDialog';
import { Button } from '@/components/ui/button';
import { useTagStore } from '@/stores/tags';
import { type Tag } from '@/types/tags';
import { TagItem } from './TagItem';

export function TagList() {
  const { tags, loadTags } = useTagStore();
  const [isOpen, setIsOpen] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | undefined>();

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  function handleCreate(e: React.MouseEvent) {
    e.stopPropagation();
    setEditingTag(undefined);
    setIsDialogOpen(true);
  }

  function handleEdit(tag: Tag) {
    setEditingTag(tag);
    setIsDialogOpen(true);
  }

  return (
    <div className="mt-4">
      <div
        className="px-2 py-1 mx-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center justify-between group cursor-pointer hover:bg-accent/50 rounded-sm select-none transition-colors"
        onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center gap-1">
          {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <div className="flex items-center gap-2">
            <Hash className="w-3 h-3" />
            Tags
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCreate}>
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      {isOpen && (
        <div className="space-y-0.5 mt-1">
          {tags.map(tag => (
            <TagItem
              key={tag.id}
              tag={tag}
              onEdit={() => handleEdit(tag)}
            />
          ))}
        </div>
      )}
      <TagDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        tagId={editingTag?.id}
        initialName={editingTag?.name}
        initialColor={editingTag?.color}
      />
    </div>
  );
}
