export type Folder = {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date;
  parent_id?: number;
  folder_path: string;
  isDeleted?: boolean;
  deletedAt?: string | null;
  icon?: string | null;
  color?: string | null;
};
