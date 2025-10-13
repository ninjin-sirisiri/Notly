import { Input } from '@/components/ui/input';
import type { CreateNoteInputProps } from './types';

export function CreateNoteInput({ value, onChange, onSubmit, onCancel }: CreateNoteInputProps) {
  return (
    <div className="mb-2 px-2">
      <Input
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
        autoFocus
        className="text-sm"
      />
    </div>
  );
}
