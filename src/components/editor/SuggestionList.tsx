import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from '@/lib/utils';

export type SuggestionListProps = {
  items: string[];
  command: (item: { noteName: string }) => void;
};

export type SuggestionListRef = {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
};

export const SuggestionList = forwardRef<SuggestionListRef, SuggestionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  function selectItem(index: number) {
    const item = props.items[index];
    if (item) {
      props.command({ noteName: item });
    }
  }

  function upHandler() {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  }

  function downHandler() {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  }

  function enterHandler() {
    selectItem(selectedIndex);
  }

  useEffect(() => {
    setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (props.items.length === 0) {
        return false;
      }

      if (event.key === 'ArrowUp') {
        upHandler();
        return true;
      }

      if (event.key === 'ArrowDown') {
        downHandler();
        return true;
      }

      if (event.key === 'Enter') {
        enterHandler();
        return true;
      }

      return false;
    }
  }));

  if (props.items.length === 0) {
    return <div className="hidden" />;
  }

  return (
    <div className="z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
      <div className="flex flex-col gap-0.5">
        {props.items.map((item, index) => (
          <button
            key={item}
            className={cn(
              'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors w-full text-left',
              index === selectedIndex
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={() => selectItem(index)}>
            {item}
          </button>
        ))}
      </div>
    </div>
  );
});

SuggestionList.displayName = 'SuggestionList';
