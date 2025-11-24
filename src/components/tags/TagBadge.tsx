import { X } from 'lucide-react';
import React from 'react';
import { cn } from '@/lib/utils';
import { type Tag } from '@/types/tags';

type TagBadgeProps = {
  tag: Tag;
  onRemove?: () => void;
  className?: string;
  onClick?: () => void;
};

export function TagBadge({ tag, onRemove, className, onClick }: TagBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-secondary text-secondary-foreground transition-colors',
        onClick && 'cursor-pointer hover:bg-secondary/80',
        className
      )}
      style={tag.color ? { backgroundColor: `${tag.color}20`, color: tag.color } : undefined}
      onClick={onClick}>
      {tag.name}
      {onRemove && (
        <button
          onClick={e => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1.5 hover:opacity-70 focus:outline-none">
          <X className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
