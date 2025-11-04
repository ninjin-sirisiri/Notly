import { Button } from '@/components/ui/button';
import { useCreateNote, useNotes } from '@/hooks/useNote';
import { FileText } from 'lucide-react';

export function CreateNoteButton() {
	const { loadNotes } = useNotes();
  const { createNote, isLoading } = useCreateNote();

  const handleCreateNote = async () => {
    try {
      await createNote('Untitled', '', '');
      console.log('Note created successfully');
			loadNotes();
    } catch (error) {
      console.error('Failed to create note:', error);
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleCreateNote}
      disabled={isLoading}
    >
      <FileText className="h-4 w-4" />
      ノート
    </Button>
  );
}
