import { useEffect, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { loadNote } from '@/lib/api/notes';
import { getTagsByNote } from '@/lib/api/tags';
import { type Note } from '@/types/notes';
import { type Tag } from '@/types/tags';

type NoteInfoDialogProps = {
  noteId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function NoteInfoDialog({ noteId, open, onOpenChange }: NoteInfoDialogProps) {
  const [info, setInfo] = useState<{
    note: Note | null;
    content: string;
    tags: Tag[];
  }>({ note: null, content: '', tags: [] });

  useEffect(() => {
    if (open) {
      Promise.all([loadNote(noteId), getTagsByNote(noteId)]).then(
        ([noteWithContent, tags]) => {
          setInfo({
            note: noteWithContent,
            content: noteWithContent.content,
            tags
          });
        }
      );
    }
  }, [noteId, open]);

  if (!info.note) return null;

  const charCount = info.content.length;
  // 簡易的な単語数カウント（空白区切り）
  const wordCount = info.content.trim() === '' ? 0 : info.content.trim().split(/\s+/).length;

  const formatDate = (dateStr: Date | string) => {
    return new Date(dateStr).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>ノート詳細</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
            <div className="text-muted-foreground">タイトル</div>
            <div className="font-medium">{info.note.title}</div>

            <div className="text-muted-foreground">作成日時</div>
            <div>{formatDate(info.note.created_at)}</div>
            
            <div className="text-muted-foreground">更新日時</div>
            <div>{formatDate(info.note.updated_at)}</div>
            
            <div className="text-muted-foreground">文字数</div>
            <div>{charCount} 文字</div>

            <div className="text-muted-foreground">単語数</div>
            <div>{wordCount} 単語</div>
            
            <div className="text-muted-foreground">場所</div>
            <div className="break-all text-xs text-muted-foreground">{info.note.file_path}</div>
            
            <div className="text-muted-foreground">タグ</div>
            <div className="flex flex-wrap gap-1">
              {info.tags.length > 0 ? info.tags.map(tag => (
                <span 
                  key={tag.id} 
                  className="px-2 py-0.5 bg-secondary rounded text-xs flex items-center gap-1"
                >
                  <div 
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: tag.color || '#9ca3af' }}
                  />
                  {tag.name}
                </span>
              )) : "なし"}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
