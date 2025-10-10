"use client";

import {
  createContext,
  useState,
  useEffect,
  useCallback,
  useContext,
  ReactNode,
} from "react";
import type { Note } from "../types/database";

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  error: Error | null;
  createNote: (title: string, content: string, folderId?: string) => Promise<any>;
  updateNote: (id: string, title?: string, content?: string) => Promise<any>;
  deleteNote: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      const result = await window.api.note.list({});
      setNotes(result.notes);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const createNote = async (title: string, content: string, folderId?: string) => {
    const result = await window.api.note.create({
      title,
      content,
      folderId,
    });
    await loadNotes();
    return result;
  };

  const updateNote = async (id: string, title?: string, content?: string) => {
    const result = await window.api.note.update({
      id,
      title,
      content,
    });
    await loadNotes();
    return result;
  };

  const deleteNote = async (id: string) => {
    await window.api.note.delete({ id });
    await loadNotes();
  };

  const value = {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refresh: loadNotes,
  };

  return <NotesContext.Provider value={value}>{children}</NotesContext.Provider>;
}

export function useNotesContext() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error("useNotesContext must be used within a NotesProvider");
  }
  return context;
}