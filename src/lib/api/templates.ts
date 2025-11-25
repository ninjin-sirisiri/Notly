import {
  type Template,
  type CreateTemplateInput,
  type UpdateTemplateInput
} from '@/types/templates';
import { invoke } from '@tauri-apps/api/core';

export async function getAllTemplates(): Promise<Template[]> {
  return await invoke<Template[]>('get_all_templates');
}

export async function getTemplateById(id: number): Promise<Template> {
  return await invoke<Template>('get_template_by_id', { id });
}

export async function createTemplate(input: CreateTemplateInput): Promise<Template> {
  return await invoke<Template>('create_template', { input });
}

export async function updateTemplate(input: UpdateTemplateInput): Promise<Template> {
  return await invoke<Template>('update_template', { input });
}

export async function deleteTemplate(id: number): Promise<void> {
  return await invoke<void>('delete_template', { id });
}
