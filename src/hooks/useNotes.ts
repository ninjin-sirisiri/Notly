// src/hooks/useNotes.ts
import { useState, useEffect, useCallback } from "react";
import type { Note } from "../types/database";

export function useNotes(folderId?: string) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const result = await window.api.note.list({ folderId });
      setNotes(result.notes);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = async (title: string, content: string) => {
    const result = await window.api.note.create({
      title,
      content,
      folderId,
    });
    await loadNotes();
    return result;
    return Promise.reject(new Error("API not available"));
  };

  const updateNote = async (id: string, title?: string, content?: string) => {
    const result = await window.api.note.update({
      id,
      title,
      content,
    });
    await loadNotes();
    return result;
    return Promise.reject(new Error("API not available"));
  };

  const deleteNote = async (id: string) => {
    await window.api.note.delete({ id });
    await loadNotes();
  };

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refresh: loadNotes,
  };
}
