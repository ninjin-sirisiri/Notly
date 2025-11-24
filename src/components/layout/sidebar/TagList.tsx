import { ChevronDown, ChevronRight, Hash } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTagStore } from '@/stores/tags';
import { TagItem } from './TagItem';

export function TagList() {
  const { tags, loadTags } = useTagStore();
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className="mt-4">
      <div
        className="px-2 py-1 mx-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1 cursor-pointer hover:bg-accent/50 rounded-sm select-none transition-colors"
        onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <div className="flex items-center gap-2">
          <Hash className="w-3 h-3" />
          Tags
        </div>
      </div>
      {isOpen && (
        <div className="space-y-0.5 mt-1">
          {tags.map(tag => (
            <TagItem
              key={tag.id}
              tag={tag}
            />
          ))}
        </div>
      )}
    </div>
  );
}
