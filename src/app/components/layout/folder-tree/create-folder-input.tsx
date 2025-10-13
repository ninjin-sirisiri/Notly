import { Input } from '@/components/ui/input';

import type { CreateFolderInputProps } from './types';

export function CreateFolderInput({ value, onChange, onSubmit, onCancel }: CreateFolderInputProps) {
  return (
    <div className="mb-2 px-2">
      <Input
        type="text"
        placeholder="Folder name..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onSubmit();
          }
          if (e.key === 'Escape') {
            onCancel();
          }
        }}
        autoFocus
        className="text-sm"
      />
    </div>
  );
}
