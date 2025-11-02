import { FileText, Edit2, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type NoteItemProps = {
  name: string;
  isActive?: boolean;
  hasIcon?: boolean;
};

export function NoteItem({ name, isActive, hasIcon = true }: NoteItemProps) {
  return (
    <a
      className={cn(
        'flex items-center gap-2 pl-6 pr-2 py-1.5 rounded text-primary dark:text-white group relative',
        isActive
          ? 'bg-gray-300/50 dark:bg-gray-600/50'
          : 'hover:bg-gray-200 dark:hover:bg-gray-700/50'
      )}
      href="#"
    >
      {hasIcon && <FileText className="h-4 w-4" />}
      <p className="text-sm font-medium truncate">{name}</p>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className={cn(
            'p-1 rounded',
            isActive
              ? 'hover:bg-gray-400/50 dark:hover:bg-gray-500/50'
              : 'hover:bg-gray-300 dark:hover:bg-gray-600'
          )}
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          className={cn(
            'p-1 rounded',
            isActive
              ? 'hover:bg-gray-400/50 dark:hover:bg-gray-500/50'
              : 'hover:bg-gray-300 dark:hover:bg-gray-600'
          )}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </a>
  );
}
