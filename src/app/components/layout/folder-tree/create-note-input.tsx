import { Input } from '@/components/ui/input';
import { useEffect, useRef } from 'react';
import type { CreateNoteInputProps } from './types';

export function CreateNoteInput({ value, onChange, onSubmit, onCancel }: CreateNoteInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="mb-2 px-2">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Note title..."
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
