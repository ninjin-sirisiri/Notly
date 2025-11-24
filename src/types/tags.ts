export type Tag = {
  id: number;
  name: string;
  color: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTagInput = {
  name: string;
  color?: string | null;
};

export type UpdateTagInput = {
  id: number;
  name: string;
  color?: string | null;
};
