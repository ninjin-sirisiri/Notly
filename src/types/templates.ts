export type Template = {
  id: number;
  name: string;
  content: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateTemplateInput = {
  name: string;
  content: string;
  description?: string | null;
};

export type UpdateTemplateInput = {
  id: number;
  name: string;
  content: string;
  description?: string | null;
};
