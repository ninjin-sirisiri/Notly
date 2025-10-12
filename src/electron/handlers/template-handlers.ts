// src/electron/handlers/template-handlers.ts
import { ipcMain } from 'electron';
import fs from 'fs/promises';
import path from 'path';
import { getTemplatesPath } from '../database';
import type { CreateTemplateRequest, CreateTemplateResponse, Template } from '../../types/api';

export function registerTemplateHandlers() {
  ipcMain.handle(
    'TEMPLATE_CREATE',
    async (_, data: CreateTemplateRequest): Promise<CreateTemplateResponse> => {
      const templatesPath = getTemplatesPath();
      const templateId = crypto.randomUUID();
      const fileName = `${templateId}.md`;
      const filePath = path.join(templatesPath, fileName);

      const content = `---
name: ${data.name}
---
${data.content}`;

      await fs.writeFile(filePath, content, 'utf-8');

      const template: Template = {
        id: templateId,
        name: data.name,
        content: data.content,
      };

      return { template };
    }
  );

  ipcMain.handle('TEMPLATE_LIST', async () => {
    const templatesPath = getTemplatesPath();
    const files = await fs.readdir(templatesPath);

    const templates: Template[] = [];

    for (const file of files) {
      if (!file.endsWith('.md')) continue;

      const filePath = path.join(templatesPath, file);
      const content = await fs.readFile(filePath, 'utf-8');

      const match = content.match(/^---\nname: (.+)\n---\n([\s\S]+)$/);
      if (match) {
        templates.push({
          id: file.replace('.md', ''),
          name: match[1],
          content: match[2],
        });
      }
    }

    return { templates };
  });

  ipcMain.handle('TEMPLATE_READ', async (_, id: string) => {
    const templatesPath = getTemplatesPath();
    const filePath = path.join(templatesPath, `${id}.md`);

    const content = await fs.readFile(filePath, 'utf-8');
    const match = content.match(/^---\nname: (.+)\n---\n([\s\S]+)$/);

    if (!match) throw new Error('Invalid template format');

    const template: Template = {
      id,
      name: match[1],
      content: match[2],
    };

    return { template };
  });

  ipcMain.handle('TEMPLATE_DELETE', async (_, id: string) => {
    const templatesPath = getTemplatesPath();
    const filePath = path.join(templatesPath, `${id}.md`);
    await fs.unlink(filePath);
    return { success: true };
  });
}
