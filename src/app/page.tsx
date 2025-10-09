"use client";

import { useEffect, useState } from "react";
import type { Note } from "../types/database";

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const result = await window.api.note.list();
      setNotes(result.notes);
    } catch (error) {
      console.error("Failed to load notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    try {
      await window.api.note.create({
        title: "新しいノート",
        content: "# 新しいノート\n\nここに内容を書く",
      });
      loadNotes();
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  if (loading) return <div>読み込み中...</div>;

  return (
    <div className="p-8 bg-gray-50 w-full">
      <h1 className="text-3xl font-bold mb-4">Notly</h1>
      <button
        onClick={createNote}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-4"
      >
        新しいノートを作成
      </button>
      <ul className="space-y-2">
        {notes.map((note) => (
          <li key={note.id} className="border p-4 rounded">
            <h3 className="font-semibold">{note.title}</h3>
            <p className="text-sm text-gray-500">
              {new Date(note.createdAt).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
