import { Save } from 'lucide-react';

import { Button } from '../ui/button';
import { Spinner } from '../ui/spinner';

type Props = {
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  handleSave: () => void;
  created_at: Date;
  isLoading: boolean;
  isNewNote: boolean;
};

export function EditorHeader({
  title,
  setTitle,
  handleSave,
  created_at,
  isLoading,
  isNewNote
}: Props) {
  return (
    <div className="flex items-center sm:justify-between gap-2 p-2">
      <input
        className="w-full text-2xl md:text-4xl font-black leading-tight tracking-[-0.033em] text-primary dark:text-white p-0.5"
        value={title}
        onChange={e => setTitle(e.target.value)}
        onBlur={() => {
          if (!isNewNote) {
            handleSave();
          }
        }}
      />
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleSave}
          disabled={isLoading}>
          <Save />
          {isLoading ? (
            <>
              <Spinner />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save</span>
          )}
        </Button>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {created_at.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
