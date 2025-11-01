import { useEffect } from 'react';
import { useNoteStore } from '@/stores/note';

export function useNotes() {
  const { notes, isLoading, error, loadNotes } = useNoteStore();

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return { notes, isLoading, error };
}

export function useCurrentNote() {
  const {
    currentNote,
    currentContent,
    isLoading,
    error,
    loadNote,
    setCurrentContent,
    updateNote
  } = useNoteStore();

  return {
    currentNote,
    currentContent,
    isLoading,
    error,
    loadNote,
    setCurrentContent,
    updateNote
  };
}

export function useCreateNote() {
  const { createNote, isLoading, error } = useNoteStore();

  return {
    createNote,
    isLoading,
    error
  };
}

export function useDeleteNote() {
  const { deleteNote, isLoading, error } = useNoteStore();

  return {
    deleteNote,
    isLoading,
    error
  };
}
