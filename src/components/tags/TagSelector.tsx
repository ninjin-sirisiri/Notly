import { Plus } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useTagStore } from '@/stores/tags';
import { type Tag } from '@/types/tags';
import { TagBadge } from './TagBadge';

type TagSelectorProps = {
  selectedTags: Tag[];
  onTagSelect: (tag: Tag) => void;
  onTagRemove: (tagId: number) => void;
  className?: string;
};

export function TagSelector({
  selectedTags,
  onTagSelect,
  onTagRemove,
  className
}: TagSelectorProps) {
  const { tags, loadTags, createTag } = useTagStore();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Tag[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadTags();
  }, [loadTags]);

  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions(tags.filter(t => !selectedTags.some(st => st.id === t.id)));
    } else {
      setSuggestions(
        tags.filter(
          t =>
            t.name.toLowerCase().includes(inputValue.toLowerCase()) &&
            !selectedTags.some(st => st.id === t.id)
        )
      );
    }
  }, [inputValue, tags, selectedTags]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  async function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      const existingTag = tags.find(t => t.name.toLowerCase() === inputValue.trim().toLowerCase());

      if (existingTag) {
        if (!selectedTags.some(t => t.id === existingTag.id)) {
          onTagSelect(existingTag);
        }
      } else {
        // Create new tag
        try {
          const newTag = await createTag(inputValue.trim());
          onTagSelect(newTag);
        } catch {
          // ignore
        }
      }
      setInputValue('');
    } else if (e.key === 'Backspace' && inputValue === '' && selectedTags.length > 0) {
      const lastTag = selectedTags.at(-1);
      if (lastTag) {
        onTagRemove(lastTag.id);
      }
    }
  }

  return (
    <div
      className={cn('relative z-50', className)}
      ref={containerRef}>
      <div
        className={cn(
          'flex flex-wrap gap-1.5 p-2 bg-background border rounded-md min-h-[42px]',
          isFocused ? 'ring-2 ring-ring ring-offset-2 border-primary' : 'border-input'
        )}
        onClick={() => inputRef.current?.focus()}>
        {selectedTags.map(tag => (
          <TagBadge
            key={tag.id}
            tag={tag}
            onRemove={() => onTagRemove(tag.id)}
          />
        ))}
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onKeyDown={handleKeyDown}
          placeholder={selectedTags.length === 0 ? 'Add tags...' : ''}
          className="flex-1 bg-transparent outline-none min-w-[80px] text-sm"
        />
      </div>

      {isFocused && (suggestions.length > 0 || inputValue.trim() !== '') && (
        <div className="absolute z-10 w-full mt-1 bg-popover text-popover-foreground border rounded-md shadow-md max-h-60 overflow-auto">
          {suggestions.map(tag => (
            <div
              key={tag.id}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
              onClick={() => {
                onTagSelect(tag);
                setInputValue('');
                inputRef.current?.focus();
              }}>
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: tag.color || '#888' }}
              />
              {tag.name}
            </div>
          ))}
          {inputValue.trim() !== '' &&
            !suggestions.some(s => s.name.toLowerCase() === inputValue.trim().toLowerCase()) && (
              <div
                className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground flex items-center gap-2 text-muted-foreground"
                onClick={async () => {
                  try {
                    const newTag = await createTag(inputValue.trim());
                    onTagSelect(newTag);
                    setInputValue('');
                    inputRef.current?.focus();
                  } catch {
                    // ignore
                  }
                }}>
                <Plus className="h-3 w-3" />
                Create &quot;{inputValue}&quot;
              </div>
            )}
        </div>
      )}
    </div>
  );
}
