export type Note = {
  id: number;
  file_path: string;
  title: string;
  created_at: Date;
  updated_at: Date;
  parent_id: number | null;
};

export type NoteWithContent = Note & {
  content: string;
};
