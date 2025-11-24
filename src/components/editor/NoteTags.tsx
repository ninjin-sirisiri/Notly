import { useEffect, useState } from 'react';
import { TagSelector } from '@/components/tags/TagSelector';
import { useTagStore } from '@/stores/tags';
import { type Tag } from '@/types/tags';

type NoteTagsProps = {
  noteId: number;
};

export function NoteTags({ noteId }: NoteTagsProps) {
  const { getTagsByNote, addTagToNote, removeTagFromNote } = useTagStore();
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  useEffect(() => {
    async function fetchTags() {
      if (noteId) {
        try {
          const tags = await getTagsByNote(noteId);
          setSelectedTags(tags);
        } catch {
          // ignore
        }
      } else {
        setSelectedTags([]);
      }
    }
    fetchTags();
  }, [noteId, getTagsByNote]);

  async function handleTagSelect(tag: Tag) {
    try {
      await addTagToNote(noteId, tag.id);
      setSelectedTags(prev => [...prev, tag]);
    } catch {
      // ignore
    }
  }

  async function handleTagRemove(tagId: number) {
    try {
      await removeTagFromNote(noteId, tagId);
      setSelectedTags(prev => prev.filter(t => t.id !== tagId));
    } catch {
      // ignore
    }
  }

  return (
    <div className="mt-2 mb-4">
      <TagSelector
        selectedTags={selectedTags}
        onTagSelect={handleTagSelect}
        onTagRemove={handleTagRemove}
      />
    </div>
  );
}
