import { describe, test, expect, beforeEach, mock, beforeAll } from 'bun:test';
import { Window } from 'happy-dom';
import { useTagStore } from '@/stores/tags';
import { type Tag } from '@/types/tags';
import { render } from '@testing-library/react';
import { TagSelector } from './TagSelector';

// DOM環境を初期化
beforeAll(() => {
  const window = new Window();
  const document = window.document;

  globalThis.window = window as unknown as Window & typeof globalThis;
  globalThis.document = document;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.Element = window.Element;
  globalThis.Node = window.Node;
  globalThis.navigator = window.navigator;
  globalThis.localStorage = window.localStorage;
  globalThis.sessionStorage = window.sessionStorage;
});

// APIモック
const mockGetAllTags = mock(() =>
  Promise.resolve([
    { id: 1, name: 'Tag1', color: '#FF0000', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 2, name: 'Tag2', color: '#00FF00', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 3, name: 'Tag3', color: null, createdAt: '2024-01-01', updatedAt: '2024-01-01' }
  ] as Tag[])
);
const mockCreateTag = mock(() => Promise.resolve({} as Tag));

// APIモジュールをモック
mock.module('@/lib/api/tags', () => ({
  getAllTags: mockGetAllTags,
  createTag: mockCreateTag
}));

describe('TagSelector', () => {
  const mockTags: Tag[] = [
    { id: 1, name: 'Tag1', color: '#FF0000', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
    { id: 2, name: 'Tag2', color: '#00FF00', createdAt: '2024-01-01', updatedAt: '2024-01-01' }
  ];

  const mockOnTagSelect = mock(() => {});
  const mockOnTagRemove = mock(() => {});

  beforeEach(() => {
    mockOnTagSelect.mockClear();
    mockOnTagRemove.mockClear();
    mockGetAllTags.mockClear();
    mockCreateTag.mockClear();
    // ストアの状態をリセット
    useTagStore.setState({
      tags: [],
      isLoading: false,
      error: null
    });
  });

  test('コンポーネントがレンダリングされる', () => {
    const { container } = render(
      <TagSelector
        selectedTags={[]}
        onTagSelect={mockOnTagSelect}
        onTagRemove={mockOnTagRemove}
      />
    );
    expect(container).toBeTruthy();
  });

  test('選択されたタグが表示される', () => {
    const { container } = render(
      <TagSelector
        selectedTags={mockTags}
        onTagSelect={mockOnTagSelect}
        onTagRemove={mockOnTagRemove}
      />
    );

    expect(container.textContent).toContain('Tag1');
    expect(container.textContent).toContain('Tag2');
  });

  test('入力フィールドが表示される', () => {
    const { container } = render(
      <TagSelector
        selectedTags={[]}
        onTagSelect={mockOnTagSelect}
        onTagRemove={mockOnTagRemove}
      />
    );

    const input = container.querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.getAttribute('placeholder')).toBe('タグを追加...');
  });

  test('タグが選択されている場合、プレースホルダーが空になる', () => {
    const { container } = render(
      <TagSelector
        selectedTags={mockTags}
        onTagSelect={mockOnTagSelect}
        onTagRemove={mockOnTagRemove}
      />
    );

    const input = container.querySelector('input');
    expect(input?.getAttribute('placeholder')).toBe('');
  });

  test('loadTagsが呼ばれる', async () => {
    render(
      <TagSelector
        selectedTags={[]}
        onTagSelect={mockOnTagSelect}
        onTagRemove={mockOnTagRemove}
      />
    );

    // useEffectでloadTagsが呼ばれ、それがgetAllTagsを呼ぶことを確認
    // 非同期処理のため、少し待機が必要
    await new Promise(resolve => setTimeout(resolve, 10));
    expect(mockGetAllTags).toHaveBeenCalled();
  });
});
