import { describe, test, expect, beforeEach, mock } from 'bun:test';
import { type Tag } from '@/types/tags';
import { useTagStore } from './tags';

// APIモック
const mockGetAllTags = mock(() => Promise.resolve([]));
const mockCreateTag = mock(() => Promise.resolve({} as Tag));
const mockUpdateTag = mock(() => Promise.resolve({} as Tag));
const mockDeleteTag = mock(() => Promise.resolve());
const mockAddTagToNote = mock(() => Promise.resolve());
const mockRemoveTagFromNote = mock(() => Promise.resolve());
const mockGetTagsByNote = mock(() => Promise.resolve([]));

// APIモジュールをモック
mock.module('@/lib/api/tags', () => ({
  getAllTags: mockGetAllTags,
  createTag: mockCreateTag,
  updateTag: mockUpdateTag,
  deleteTag: mockDeleteTag,
  addTagToNote: mockAddTagToNote,
  removeTagFromNote: mockRemoveTagFromNote,
  getTagsByNote: mockGetTagsByNote
}));

describe('useTagStore', () => {
  beforeEach(() => {
    // 各テスト前にストアとモックをリセット
    useTagStore.setState({
      tags: [],
      isLoading: false,
      error: null
    });
    mockGetAllTags.mockClear();
    mockCreateTag.mockClear();
    mockUpdateTag.mockClear();
    mockDeleteTag.mockClear();
    mockAddTagToNote.mockClear();
    mockRemoveTagFromNote.mockClear();
    mockGetTagsByNote.mockClear();
  });

  describe('loadTags', () => {
    test('タグを正常に読み込む', async () => {
      const mockTags: Tag[] = [
        {
          id: 1,
          name: 'Work',
          color: '#ff0000',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 2,
          name: 'Personal',
          color: '#00ff00',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ];

      mockGetAllTags.mockResolvedValue(mockTags);

      const { loadTags } = useTagStore.getState();
      await loadTags();

      const state = useTagStore.getState();
      expect(state.tags).toEqual(mockTags);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('エラー時にエラーメッセージを設定する', async () => {
      mockGetAllTags.mockRejectedValue(new Error('Failed to load tags'));

      const { loadTags } = useTagStore.getState();
      await loadTags();

      const state = useTagStore.getState();
      expect(state.error).toBe('Error: Failed to load tags');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('createTag', () => {
    test('タグを正常に作成する', async () => {
      const newTag: Tag = {
        id: 3,
        name: 'Important',
        color: '#0000ff',
        created_at: '2024-01-03',
        updated_at: '2024-01-03'
      };

      mockCreateTag.mockResolvedValue(newTag);

      const { createTag } = useTagStore.getState();
      const result = await createTag('Important', '#0000ff');

      expect(result).toEqual(newTag);
      const state = useTagStore.getState();
      expect(state.tags).toContainEqual(newTag);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('作成したタグはアルファベット順にソートされる', async () => {
      const existingTags: Tag[] = [
        {
          id: 1,
          name: 'Work',
          color: '#ff0000',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 2,
          name: 'Personal',
          color: '#00ff00',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ];

      useTagStore.setState({ tags: existingTags });

      const newTag: Tag = {
        id: 3,
        name: 'Important',
        color: '#0000ff',
        created_at: '2024-01-03',
        updated_at: '2024-01-03'
      };

      mockCreateTag.mockResolvedValue(newTag);

      const { createTag } = useTagStore.getState();
      await createTag('Important', '#0000ff');

      const state = useTagStore.getState();
      expect(state.tags.map(t => t.name)).toEqual(['Important', 'Personal', 'Work']);
    });

    test('エラー時にエラーメッセージを設定してthrowする', async () => {
      mockCreateTag.mockRejectedValue(new Error('Failed to create tag'));

      const { createTag } = useTagStore.getState();

      await expect(createTag('Test', '#000000')).rejects.toThrow('Failed to create tag');

      const state = useTagStore.getState();
      expect(state.error).toBe('Error: Failed to create tag');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('updateTag', () => {
    test('タグを正常に更新する', async () => {
      const existingTags: Tag[] = [
        {
          id: 1,
          name: 'Work',
          color: '#ff0000',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 2,
          name: 'Personal',
          color: '#00ff00',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ];

      useTagStore.setState({ tags: existingTags });

      const updatedTag: Tag = {
        id: 1,
        name: 'Work Updated',
        color: '#ff00ff',
        created_at: '2024-01-01',
        updated_at: '2024-01-03'
      };

      mockUpdateTag.mockResolvedValue(updatedTag);

      const { updateTag } = useTagStore.getState();
      const result = await updateTag(1, 'Work Updated', '#ff00ff');

      expect(result).toEqual(updatedTag);
      const state = useTagStore.getState();
      expect(state.tags.find(t => t.id === 1)).toEqual(updatedTag);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('更新後もアルファベット順にソートされる', async () => {
      const existingTags: Tag[] = [
        {
          id: 1,
          name: 'A-Tag',
          color: '#ff0000',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 2,
          name: 'B-Tag',
          color: '#00ff00',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ];

      useTagStore.setState({ tags: existingTags });

      const updatedTag: Tag = {
        id: 1,
        name: 'Z-Tag',
        color: '#ff00ff',
        created_at: '2024-01-01',
        updated_at: '2024-01-03'
      };

      mockUpdateTag.mockResolvedValue(updatedTag);

      const { updateTag } = useTagStore.getState();
      await updateTag(1, 'Z-Tag', '#ff00ff');

      const state = useTagStore.getState();
      expect(state.tags.map(t => t.name)).toEqual(['B-Tag', 'Z-Tag']);
    });

    test('エラー時にエラーメッセージを設定してthrowする', async () => {
      mockUpdateTag.mockRejectedValue(new Error('Failed to update tag'));

      const { updateTag } = useTagStore.getState();

      await expect(updateTag(1, 'Test', '#000000')).rejects.toThrow('Failed to update tag');

      const state = useTagStore.getState();
      expect(state.error).toBe('Error: Failed to update tag');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('deleteTag', () => {
    test('タグを正常に削除する', async () => {
      const existingTags: Tag[] = [
        {
          id: 1,
          name: 'Work',
          color: '#ff0000',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        },
        {
          id: 2,
          name: 'Personal',
          color: '#00ff00',
          created_at: '2024-01-02',
          updated_at: '2024-01-02'
        }
      ];

      useTagStore.setState({ tags: existingTags });

      mockDeleteTag.mockResolvedValue(undefined);

      const { deleteTag } = useTagStore.getState();
      await deleteTag(1);

      const state = useTagStore.getState();
      expect(state.tags).toHaveLength(1);
      expect(state.tags[0].id).toBe(2);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    test('エラー時にエラーメッセージを設定する', async () => {
      mockDeleteTag.mockRejectedValue(new Error('Failed to delete tag'));

      const { deleteTag } = useTagStore.getState();

      // エラーがthrowされないようにtry-catchで囲む
      try {
        await deleteTag(1);
      } catch {
        // エラーは無視
      }

      const state = useTagStore.getState();
      expect(state.error).toBe('Error: Failed to delete tag');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('addTagToNote', () => {
    test('ノートにタグを追加する', async () => {
      mockAddTagToNote.mockResolvedValue(undefined);

      const { addTagToNote } = useTagStore.getState();
      await addTagToNote(1, 2);

      expect(mockAddTagToNote).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('removeTagFromNote', () => {
    test('ノートからタグを削除する', async () => {
      mockRemoveTagFromNote.mockResolvedValue(undefined);

      const { removeTagFromNote } = useTagStore.getState();
      await removeTagFromNote(1, 2);

      expect(mockRemoveTagFromNote).toHaveBeenCalledWith(1, 2);
    });
  });

  describe('getTagsByNote', () => {
    test('ノートのタグを取得する', async () => {
      const mockTags: Tag[] = [
        {
          id: 1,
          name: 'Work',
          color: '#ff0000',
          created_at: '2024-01-01',
          updated_at: '2024-01-01'
        }
      ];

      mockGetTagsByNote.mockResolvedValue(mockTags);

      const { getTagsByNote } = useTagStore.getState();
      const result = await getTagsByNote(1);

      expect(result).toEqual(mockTags);
      expect(mockGetTagsByNote).toHaveBeenCalledWith(1);
    });
  });
});
