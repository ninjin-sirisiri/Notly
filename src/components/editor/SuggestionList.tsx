import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { cn } from '@/lib/utils';

export type SuggestionItem = {
  title: string;
  path: string;
  id: number | string;
};

export type SuggestionListProps = {
  items: SuggestionItem[];
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
      // パスがある場合はパス付きの名前を使用、なければタイトルのみ
      // ルートの場合はパスが空文字または"/"になる想定
      let noteName = item.title;
      // idが'new'の場合はパス（"New Note"など）を結合しない
      if (item.id !== 'new' && item.path && item.path !== '/' && item.path !== '\\') {
        // パスの末尾がセパレータでないことを確認
        const separator = item.path.endsWith('/') || item.path.endsWith('\\') ? '' : '/';
        noteName = `${item.path}${separator}${item.title}`;
      }
      props.command({ noteName });
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
    <div className="z-50 min-w-[12rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95">
      <div className="flex flex-col gap-0.5">
        {props.items.map((item, index) => (
          <button
            key={`${item.id}-${index}`}
            className={cn(
              'relative flex flex-col cursor-default select-none rounded-sm px-2 py-1.5 text-sm outline-none transition-colors w-full text-left',
              index === selectedIndex
                ? 'bg-accent text-accent-foreground'
                : 'hover:bg-accent hover:text-accent-foreground'
            )}
            onClick={() => selectItem(index)}>
            <span className="font-medium">{item.title}</span>
            {item.path && (
              <span className="text-xs text-muted-foreground truncate w-full">{item.path}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
});

SuggestionList.displayName = 'SuggestionList';
