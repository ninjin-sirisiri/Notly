import { Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useFileStore } from '@/stores/files';
import { type Tag } from '@/types/tags';

type TagItemProps = {
  tag: Tag;
};

export function TagItem({ tag }: TagItemProps) {
  const { setSelectedTagId, selectedTagId } = useFileStore();
  const isSelected = selectedTagId === tag.id;

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-4 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-accent/50 cursor-pointer transition-colors',
        isSelected && 'bg-accent text-foreground'
      )}
      onClick={() => setSelectedTagId(isSelected ? null : tag.id)}>
      <Hash
        className="w-3 h-3"
        style={{ color: tag.color || undefined }}
      />
      <span>{tag.name}</span>
    </div>
  );
}
