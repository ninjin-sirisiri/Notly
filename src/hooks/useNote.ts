import { useEffect } from 'react';

import { useNoteStore } from '@/stores/notes';

export function useNotes() {
  const { notes, isLoading, error, loadNote, loadNotes } = useNoteStore();

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  return {
    error,
    isLoading,
    loadNote,
    loadNotes,
    notes
  };
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
    currentContent,
    currentNote,
    error,
    isLoading,
    loadNote,
    setCurrentContent,
    setCurrentNote,
    updateNote
  };
}

export function useCreateNote() {
  const { createNote, isLoading, error } = useNoteStore();

  return {
    createNote,
    error,
    isLoading
  };
}

export function useDeleteNote() {
  const { deleteNote, isLoading, error } = useNoteStore();

  return {
    deleteNote,
    error,
    isLoading
  };
}
