import { Button } from '@/components/ui/button';
import { useCreateNote } from '@/hooks/useNote';
import { useNoteStore } from '@/stores/note';
import { FileText } from 'lucide-react';

export function CreateNoteButton() {
  const notes = useNoteStore(state => state.notes);
  const { createNote, isLoading } = useCreateNote();

  const handleCreateNote = async () => {
    try {
      const untitledNotes = notes.filter(note =>
        note.title.startsWith('Untitled')
      );
      const newTitle =
        untitledNotes.length > 0
          ? `Untitled ${untitledNotes.length + 1}`
          : 'Untitled';
      await createNote(newTitle, '', '');
      console.log('Note created successfully');
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
