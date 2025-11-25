import { create } from 'zustand';
import {
  getAllTemplates,
  getTemplateById,
  createTemplate as createTemplateApi,
  updateTemplate as updateTemplateApi,
  deleteTemplate as deleteTemplateApi
} from '@/lib/api/templates';
import {
  type Template,
  type CreateTemplateInput,
  type UpdateTemplateInput
} from '@/types/templates';

type TemplateStore = {
  templates: Template[];
  isLoading: boolean;
  error: string | null;

  loadTemplates: () => Promise<void>;
  getTemplateById: (id: number) => Promise<Template>;
  createTemplate: (input: CreateTemplateInput) => Promise<Template>;
  updateTemplate: (input: UpdateTemplateInput) => Promise<Template>;
  deleteTemplate: (id: number) => Promise<void>;
};

export const useTemplateStore = create<TemplateStore>(set => ({
  templates: [],
  isLoading: false,
  error: null,

  loadTemplates: async () => {
    set({ isLoading: true, error: null });
    try {
      const templates = await getAllTemplates();
      set({ templates, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: String(error) });
    }
  },

  getTemplateById: async (id: number) => await getTemplateById(id),

  createTemplate: async (input: CreateTemplateInput) => {
    set({ isLoading: true, error: null });
    try {
      const newTemplate = await createTemplateApi(input);
      set(state => ({
        templates: [newTemplate, ...state.templates],
        isLoading: false
      }));
      return newTemplate;
    } catch (error) {
      set({ isLoading: false, error: String(error) });
      throw error;
    }
  },

  updateTemplate: async (input: UpdateTemplateInput) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTemplate = await updateTemplateApi(input);
      set(state => ({
        templates: state.templates.map(template =>
          template.id === input.id ? updatedTemplate : template
        ),
        isLoading: false
      }));
      return updatedTemplate;
    } catch (error) {
      set({ isLoading: false, error: String(error) });
      throw error;
    }
  },

  deleteTemplate: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTemplateApi(id);
      set(state => ({
        templates: state.templates.filter(template => template.id !== id),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false, error: String(error) });
      throw error;
    }
  }
}));
