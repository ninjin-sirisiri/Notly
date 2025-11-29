import { describe, test, expect, beforeEach, mock, beforeAll } from 'bun:test';
import { Window } from 'happy-dom';
import { type Tag } from '@/types/tags';
import { render } from '@testing-library/react';
import { TagBadge } from './TagBadge';

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

describe('TagBadge', () => {
  const mockTag: Tag = {
    id: 1,
    name: 'テストタグ',
    color: '#3b82f6',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  };

  beforeEach(() => {
    // 各テスト前にクリーンアップ
  });

  test('タグ名が表示される', () => {
    const { container } = render(<TagBadge tag={mockTag} />);
    expect(container.textContent).toContain('テストタグ');
  });

  test('カラーが設定されている場合、スタイルが適用される', () => {
    const { container } = render(<TagBadge tag={mockTag} />);
    const badge = container.firstChild as HTMLElement;
    // happy-domではstyle.colorが元の値のまま返される
    expect(badge.style.color).toBe('#3b82f6');
  });

  test('カラーが設定されていない場合、デフォルトスタイルが適用される', () => {
    const tagWithoutColor: Tag = {
      id: 2,
      name: 'カラーレスタグ',
      color: null,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    };
    const { container } = render(<TagBadge tag={tagWithoutColor} />);
    const badge = container.firstChild as HTMLElement;
    // colorがnullの場合、style属性にcolorが設定されない
    expect(badge.style.color).toBe('');
  });

  test('onClickが提供されている場合、クリック可能になる', () => {
    const handleClick = mock(() => {});
    const { container } = render(
      <TagBadge
        tag={mockTag}
        onClick={handleClick}
      />
    );

    const badge = container.firstChild as HTMLElement;
    badge.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('onRemoveが提供されている場合、削除ボタンが表示される', () => {
    const handleRemove = mock(() => {});
    const { container } = render(
      <TagBadge
        tag={mockTag}
        onRemove={handleRemove}
      />
    );

    const removeButton = container.querySelector('button');
    expect(removeButton).toBeTruthy();
  });

  test('削除ボタンをクリックするとonRemoveが呼ばれる', () => {
    const handleRemove = mock(() => {});
    const { container } = render(
      <TagBadge
        tag={mockTag}
        onRemove={handleRemove}
      />
    );

    const removeButton = container.querySelector('button');
    removeButton?.click();

    expect(handleRemove).toHaveBeenCalledTimes(1);
  });

  test('削除ボタンをクリックしてもonClickは呼ばれない', () => {
    const handleClick = mock(() => {});
    const handleRemove = mock(() => {});
    const { container } = render(
      <TagBadge
        tag={mockTag}
        onClick={handleClick}
        onRemove={handleRemove}
      />
    );

    const removeButton = container.querySelector('button');
    removeButton?.click();

    expect(handleRemove).toHaveBeenCalledTimes(1);
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('カスタムクラス名が適用される', () => {
    const { container } = render(
      <TagBadge
        tag={mockTag}
        className="custom-class"
      />
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge.classList.contains('custom-class')).toBe(true);
  });
});
