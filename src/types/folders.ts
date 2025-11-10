export type Folder = {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  parent_id?: string;
  folder_path: string;
};
