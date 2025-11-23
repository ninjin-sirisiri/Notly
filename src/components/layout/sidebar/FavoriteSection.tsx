import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { useNoteStore } from '@/stores/notes';
import { type Note } from '@/types/notes';

import { NoteItem } from './tree/NoteItem';

export function FavoriteSection() {
  const { loadFavoriteNotes } = useNoteStore();
  const [favoriteNotes, setFavoriteNotes] = useState<Note[]>([]);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    async function fetchFavorites() {
      try {
        const favorites = await loadFavoriteNotes();
        setFavoriteNotes(favorites);
      } catch (error) {
        toast.error('お気に入りノートの読み込みに失敗しました', {
          description: String(error)
        });
      }
    }
    fetchFavorites();
  }, [loadFavoriteNotes]);

  // ノートの変更を監視してお気に入りリストを更新
  const notes = useNoteStore(state => state.notes);
  useEffect(() => {
    async function refreshFavorites() {
      try {
        const favorites = await loadFavoriteNotes();
        setFavoriteNotes(favorites);
      } catch (error) {
        toast.error('お気に入りノートの更新に失敗しました', {
          description: String(error)
        });
      }
    }
    refreshFavorites();
  }, [notes, loadFavoriteNotes]);

  if (favoriteNotes.length === 0) {
    return null;
  }

  return (
    <div className="px-2 mb-2">
      <button
        className="flex items-center gap-2 w-full px-3 py-2 text-sm font-semibold text-primary dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700/50 rounded transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}>
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span>お気に入り</span>
        <span className="ml-auto text-xs text-muted-foreground">{favoriteNotes.length}</span>
      </button>
      {isExpanded && (
        <div className="mt-1 space-y-0.5">
          {favoriteNotes.map(note => (
            <NoteItem
              key={note.id}
              note={note}
            />
          ))}
        </div>
      )}
    </div>
  );
}
