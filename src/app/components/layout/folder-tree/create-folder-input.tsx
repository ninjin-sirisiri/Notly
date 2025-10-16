import { Input } from '@/components/ui/input';
import { useEffect, useRef } from 'react';

import type { CreateFolderInputProps } from './types';

export function CreateFolderInput({ value, onChange, onSubmit, onCancel }: CreateFolderInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="mb-2 px-2">
      <Input
        ref={inputRef}
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
        onBlur={onCancel}
        className="text-sm"
      />
    </div>
  );
}
