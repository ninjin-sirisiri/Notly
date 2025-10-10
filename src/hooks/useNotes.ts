// src/hooks/useNotes.ts
import { useNotesContext } from "@/context/notes-context";

export function useNotes() {
  return useNotesContext();
}

