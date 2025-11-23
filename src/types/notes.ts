export type Note = {
  id: number;
  file_path: string;
  title: string;
  created_at: Date;
  updated_at: Date;
  parent_id: number | null;
  preview: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
};

export type NoteWithContent = Note & {
  content: string;
};
