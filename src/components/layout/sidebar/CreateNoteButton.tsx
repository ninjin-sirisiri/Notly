import { useCreateNote } from '@/hooks/useNote';
import { FileText } from 'lucide-react';

export function CreateNoteButton() {
  const { createNote, isLoading } = useCreateNote();

  const handleCreateNote = async () => {
    try {
      await createNote('Untitled', '', '');
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  return (
    <button
      onClick={handleCreateNote}
      disabled={isLoading}
      className="flex-1 flex items-center justify-center gap-1.5 rounded-md h-8 bg-gray-200 dark:bg-gray-700 text-primary dark:text-white text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
    >
      <FileText className="h-4 w-4" />
      ノート
    </button>
  );
}
