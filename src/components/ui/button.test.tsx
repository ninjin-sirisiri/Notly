import { describe, test, expect, mock, beforeAll } from 'bun:test';
import { Window } from 'happy-dom';
import { render } from '@testing-library/react';
import { Button } from './button';

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

describe('Button', () => {
  test('デフォルトのボタンがレンダリングされる', () => {
    const { container } = render(<Button>クリック</Button>);
    const button = container.querySelector('[data-slot="button"]');
    expect(button).toBeTruthy();
    expect(button?.textContent).toContain('クリック');
  });

  test('クリックイベントが発火する', () => {
    const handleClick = mock(() => {});
    const { container } = render(<Button onClick={handleClick}>クリック</Button>);

    const button = container.querySelector('[data-slot="button"]') as HTMLElement;
    button.click();

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('disabledの場合、クリックできない', () => {
    const handleClick = mock(() => {});
    const { container } = render(
      <Button
        disabled
        onClick={handleClick}>
        無効
      </Button>
    );

    const button = container.querySelector('[data-slot="button"]') as HTMLButtonElement;
    expect(button.disabled).toBe(true);

    button.click();
    expect(handleClick).not.toHaveBeenCalled();
  });

  test('variant="destructive"が適用される', () => {
    const { container } = render(<Button variant="destructive">削除</Button>);
    const button = container.querySelector('[data-slot="button"]') as HTMLElement;
    expect(button.classList.contains('bg-destructive')).toBe(true);
  });

  test('variant="outline"が適用される', () => {
    const { container } = render(<Button variant="outline">アウトライン</Button>);
    const button = container.querySelector('[data-slot="button"]') as HTMLElement;
    expect(button.classList.contains('border')).toBe(true);
  });

  test('variant="secondary"が適用される', () => {
    const { container } = render(<Button variant="secondary">セカンダリ</Button>);
    const button = container.querySelector('[data-slot="button"]') as HTMLElement;
    expect(button.classList.contains('bg-secondary')).toBe(true);
  });

  test('variant="ghost"が適用される', () => {
    const { container } = render(<Button variant="ghost">ゴースト</Button>);
    const button = container.querySelector('[data-slot="button"]') as HTMLElement;
    expect(button.classList.contains('hover:bg-accent')).toBe(true);
  });

  test('size="sm"が適用される', () => {
    const { container } = render(<Button size="sm">小さい</Button>);
    const button = container.querySelector('[data-slot="button"]') as HTMLElement;
    expect(button.classList.contains('h-8')).toBe(true);
  });

  test('size="lg"が適用される', () => {
    const { container } = render(<Button size="lg">大きい</Button>);
    const button = container.querySelector('[data-slot="button"]') as HTMLElement;
    expect(button.classList.contains('h-10')).toBe(true);
  });

  test('size="icon"が適用される', () => {
    const { container } = render(<Button size="icon">🔍</Button>);
    const button = container.querySelector('[data-slot="button"]') as HTMLElement;
    expect(button.classList.contains('size-9')).toBe(true);
  });

  test('カスタムクラス名が適用される', () => {
    const { container } = render(<Button className="custom-class">カスタム</Button>);
    const button = container.querySelector('[data-slot="button"]') as HTMLElement;
    expect(button.classList.contains('custom-class')).toBe(true);
  });

  test('asChildがtrueの場合、Slotコンポーネントが使用される', () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">リンク</a>
      </Button>
    );
    const link = container.querySelector('a');
    expect(link).toBeTruthy();
    expect(link?.getAttribute('href')).toBe('/test');
  });
});
