import { describe, test, expect, beforeEach, mock } from 'bun:test';
import {
  type Template,
  type CreateTemplateInput,
  type UpdateTemplateInput
} from '@/src/types/templates';
import { useTemplateStore } from './templates';

// APIモック
const mockGetAllTemplates = mock(() => Promise.resolve([]));
const mockGetTemplateById = mock(() => Promise.resolve({} as Template));
const mockCreateTemplate = mock(() => Promise.resolve({} as Template));
const mockUpdateTemplate = mock(() => Promise.resolve({} as Template));
const mockDeleteTemplate = mock(() => Promise.resolve());

// APIモジュールをモック
mock.module('@/lib/api/templates', () => ({
  getAllTemplates: mockGetAllTemplates,
  getTemplateById: mockGetTemplateById,
  createTemplate: mockCreateTemplate,
  updateTemplate: mockUpdateTemplate,
  deleteTemplate: mockDeleteTemplate
}));

describe('useTemplateStore', () => {
  beforeEach(() => {
    // 各テスト前にストアとモックをリセット
    useTemplateStore.setState({
      templates: [],
      isLoading: false,
      error: null,
      currentTemplate: null,
      isTemplateEditorOpen: false
    });
    mockGetAllTemplates.mockClear();
    mockGetTemplateById.mockClear();
    mockCreateTemplate.mockClear();
    mockUpdateTemplate.mockClear();
    mockDeleteTemplate.mockClear();
  });

  describe('loadTemplates', () => {
    test('テンプレートを正常に読み込む', async () => {
      const mockTemplates: Template[] = [
        {
          id: 1,
          name: 'Meeting Notes',
          content: '# Meeting Notes\n\n',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 2,
          name: 'Daily Journal',
          content: '# Daily Journal\n\n',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ];

      mockGetAllTemplates.mockResolvedValue(mockTemplates);

      const { loadTemplates } = useTemplateStore.getState();
      await loadTemplates();

      const state = useTemplateStore.getState();
      expect(state.templates).toEqual(mockTemplates);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('エラー時にエラーメッセージを設定する', async () => {
      mockGetAllTemplates.mockRejectedValue(new Error('Failed to load templates'));

      const { loadTemplates } = useTemplateStore.getState();
      await loadTemplates();

      const state = useTemplateStore.getState();
      expect(state.error).toBe('Error: Failed to load templates');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('getTemplateById', () => {
    test('IDでテンプレートを取得する', async () => {
      const mockTemplate: Template = {
        id: 1,
        name: 'Meeting Notes',
        content: '# Meeting Notes\n\n',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      mockGetTemplateById.mockResolvedValue(mockTemplate);

      const { getTemplateById } = useTemplateStore.getState();
      const result = await getTemplateById(1);

      expect(result).toEqual(mockTemplate);
      expect(mockGetTemplateById).toHaveBeenCalledWith(1);
    });
  });

  describe('createTemplate', () => {
    test('テンプレートを正常に作成する', async () => {
      const input: CreateTemplateInput = {
        name: 'New Template',
        content: '# New Template\n\n'
      };

      const newTemplate: Template = {
        id: 3,
        name: input.name,
        content: input.content,
        created_at: '2024-01-03',
        updated_at: '2024-01-03'
      };

      mockCreateTemplate.mockResolvedValue(newTemplate);

      const { createTemplate } = useTemplateStore.getState();
      const result = await createTemplate(input);

      expect(result).toEqual(newTemplate);
      const state = useTemplateStore.getState();
      expect(state.templates).toContainEqual(newTemplate);
      expect(state.templates[0]).toEqual(newTemplate); // 先頭に追加される
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('エラー時にエラーメッセージを設定してthrowする', async () => {
      const input: CreateTemplateInput = {
        name: 'New Template',
        content: '# New Template\n\n'
      };

      mockCreateTemplate.mockRejectedValue(new Error('Failed to create template'));

      const { createTemplate } = useTemplateStore.getState();

      await expect(createTemplate(input)).rejects.toThrow('Failed to create template');

      const state = useTemplateStore.getState();
      expect(state.error).toBe('Error: Failed to create template');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('updateTemplate', () => {
    test('テンプレートを正常に更新する', async () => {
      const existingTemplates: Template[] = [
        {
          id: 1,
          name: 'Meeting Notes',
          content: '# Meeting Notes\n\n',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 2,
          name: 'Daily Journal',
          content: '# Daily Journal\n\n',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ];

      useTemplateStore.setState({ templates: existingTemplates });

      const input: UpdateTemplateInput = {
        id: 1,
        name: 'Updated Meeting Notes',
        content: '# Updated Meeting Notes\n\n'
      };

      const updatedTemplate: Template = {
        id: 1,
        name: input.name!,
        content: input.content!,
        created_at: '2024-01-01',
        updated_at: '2024-01-03'
      };

      mockUpdateTemplate.mockResolvedValue(updatedTemplate);

      const { updateTemplate } = useTemplateStore.getState();
      const result = await updateTemplate(input);

      expect(result).toEqual(updatedTemplate);
      const state = useTemplateStore.getState();
      expect(state.templates.find(t => t.id === 1)).toEqual(updatedTemplate);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('エラー時にエラーメッセージを設定してthrowする', async () => {
      const input: UpdateTemplateInput = {
        id: 1,
        name: 'Updated Template'
      };

      mockUpdateTemplate.mockRejectedValue(new Error('Failed to update template'));

      const { updateTemplate } = useTemplateStore.getState();

      await expect(updateTemplate(input)).rejects.toThrow('Failed to update template');

      const state = useTemplateStore.getState();
      expect(state.error).toBe('Error: Failed to update template');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('deleteTemplate', () => {
    test('テンプレートを正常に削除する', async () => {
      const existingTemplates: Template[] = [
        {
          id: 1,
          name: 'Meeting Notes',
          content: '# Meeting Notes\n\n',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 2,
          name: 'Daily Journal',
          content: '# Daily Journal\n\n',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ];

      useTemplateStore.setState({ templates: existingTemplates });

      mockDeleteTemplate.mockResolvedValue(undefined);

      const { deleteTemplate } = useTemplateStore.getState();
      await deleteTemplate(1);

      const state = useTemplateStore.getState();
      expect(state.templates).toHaveLength(1);
      expect(state.templates[0].id).toBe(2);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('エラー時にエラーメッセージを設定する', async () => {
      mockDeleteTemplate.mockRejectedValue(new Error('Failed to delete template'));

      const { deleteTemplate } = useTemplateStore.getState();

      // エラーがthrowされないようにtry-catchで囲む
      try {
        await deleteTemplate(1);
      } catch {
        // エラーは無視
      }

      const state = useTemplateStore.getState();
      expect(state.error).toBe('Error: Failed to delete template');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('setCurrentTemplate', () => {
    test('現在のテンプレートを設定する', () => {
      const template: Template = {
        id: 1,
        name: 'Meeting Notes',
        content: '# Meeting Notes\n\n',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      const { setCurrentTemplate } = useTemplateStore.getState();
      setCurrentTemplate(template);

      const state = useTemplateStore.getState();
      expect(state.currentTemplate).toEqual(template);
    });

    test('現在のテンプレートをnullに設定する', () => {
      const template: Template = {
        id: 1,
        name: 'Meeting Notes',
        content: '# Meeting Notes\n\n',
        created_at: '2024-01-01',
        updated_at: '2024-01-01'
      };

      useTemplateStore.setState({ currentTemplate: template });

      const { setCurrentTemplate } = useTemplateStore.getState();
      setCurrentTemplate(null);

      const state = useTemplateStore.getState();
      expect(state.currentTemplate).toBeNull();
    });
  });

  describe('setTemplateEditorOpen', () => {
    test('テンプレートエディタの開閉状態を設定する', () => {
      const { setTemplateEditorOpen } = useTemplateStore.getState();

      setTemplateEditorOpen(true);
      expect(useTemplateStore.getState().isTemplateEditorOpen).toBe(true);

      setTemplateEditorOpen(false);
      expect(useTemplateStore.getState().isTemplateEditorOpen).toBe(false);
    });
  });
});
