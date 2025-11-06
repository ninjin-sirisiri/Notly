import { useNoteStore } from '@/stores/notes';
import { useEffect } from 'react';

export function useNotes() {
  const { notes, isLoading, error, loadNote, loadNotes } = useNoteStore();

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return { notes, loadNote, loadNotes, isLoading, error };
}

export function useCurrentNote() {
  const {
    currentNote,
    currentContent,
    isLoading,
    error,
    loadNote,
    setCurrentNote,
    setCurrentContent,
    updateNote
  } = useNoteStore();

  return {
    currentNote,
    currentContent,
    isLoading,
    error,
    loadNote,
    setCurrentNote,
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
