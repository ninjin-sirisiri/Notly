import { describe, test, expect } from 'bun:test';
import { type JSONContent } from '@tiptap/react';
import { processNode, parseMarkdownWithNoteLinks } from './markdownConverter';

describe('processNode', () => {
  test('テキストノードを処理する', () => {
    const node: JSONContent = {
      type: 'text',
      text: 'Hello World'
    };
    expect(processNode(node)).toBe('Hello World');
  });

  test('段落ノードを処理する', () => {
    const node: JSONContent = {
      type: 'paragraph',
      content: [{ type: 'text', text: 'Hello World' }]
    };
    expect(processNode(node)).toBe('Hello World\n\n');
  });

  test('見出しノードを処理する', () => {
    const h1: JSONContent = {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: 'Title' }]
    };
    expect(processNode(h1)).toBe('# Title\n\n');

    const h2: JSONContent = {
      type: 'heading',
      attrs: { level: 2 },
      content: [{ type: 'text', text: 'Subtitle' }]
    };
    expect(processNode(h2)).toBe('## Subtitle\n\n');
  });

  test('リストアイテムを処理する', () => {
    const node: JSONContent = {
      type: 'listItem',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] }]
    };
    expect(processNode(node)).toBe('- Item 1\n');
  });

  test('コードブロックを処理する', () => {
    const node: JSONContent = {
      type: 'codeBlock',
      content: [{ type: 'text', text: 'const x = 1;' }]
    };
    // 実装では改行が最後に追加される
    expect(processNode(node)).toBe('```\nconst x = 1;```\n\n');
  });

  test('引用ブロックを処理する', () => {
    const node: JSONContent = {
      type: 'blockquote',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: 'Quote text' }] }]
    };
    expect(processNode(node)).toBe('> Quote text\n\n');
  });

  test('noteLinkノードを処理する', () => {
    const node: JSONContent = {
      type: 'noteLink',
      attrs: { noteName: 'My Note' }
    };
    expect(processNode(node)).toBe('[[My Note]]');
  });

  test('画像ノードを処理する', () => {
    const node: JSONContent = {
      type: 'image',
      attrs: { src: 'image.png', alt: 'Alt text' }
    };
    expect(processNode(node)).toBe('![Alt text](image.png)');
  });

  test('noteLinkの前後の[[]]を除去する', () => {
    const node: JSONContent = {
      type: 'paragraph',
      content: [
        { type: 'text', text: '[[' },
        { type: 'noteLink', attrs: { noteName: 'Note' } },
        { type: 'text', text: ']]' }
      ]
    };
    const result = processNode(node);
    expect(result).toBe('[[Note]]\n\n');
    expect(result).not.toContain('[[[[');
  });

  test('複雑な構造を処理する', () => {
    const node: JSONContent = {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Hello ' },
        { type: 'noteLink', attrs: { noteName: 'World' } },
        { type: 'text', text: '!' }
      ]
    };
    expect(processNode(node)).toBe('Hello [[World]]!\n\n');
  });
});

describe('parseMarkdownWithNoteLinks', () => {
  test('シンプルなテキストをパースする', () => {
    const result = parseMarkdownWithNoteLinks('Hello World');
    expect(result.type).toBe('doc');
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('paragraph');
    expect(result.content[0].content?.[0]).toEqual({
      type: 'text',
      text: 'Hello World'
    });
  });

  test('noteLinkをパースする', () => {
    const result = parseMarkdownWithNoteLinks('Check [[My Note]]');
    expect(result.type).toBe('doc');
    // 実装では "Check " と "[[My Note]]" の2つの要素になる
    expect(result.content[0].content).toHaveLength(2);
    const noteLink = result.content[0].content?.find((c: JSONContent) => c.type === 'noteLink');
    expect(noteLink).toEqual({
      type: 'noteLink',
      attrs: { noteName: 'My Note' }
    });
  });

  test('画像をパースする', () => {
    const result = parseMarkdownWithNoteLinks('![Alt](image.png)');
    expect(result.type).toBe('doc');
    expect(result.content[0].content?.[0]).toEqual({
      type: 'image',
      attrs: { src: 'image.png', alt: 'Alt' }
    });
  });

  test('複数の段落をパースする', () => {
    const result = parseMarkdownWithNoteLinks('First paragraph\n\nSecond paragraph');
    expect(result.type).toBe('doc');
    expect(result.content).toHaveLength(2);
    expect(result.content[0].type).toBe('paragraph');
    expect(result.content[1].type).toBe('paragraph');
  });

  test('noteLinkと画像の両方を含む', () => {
    const result = parseMarkdownWithNoteLinks('See [[Note]] and ![Alt](img.png)');
    expect(result.type).toBe('doc');
    const content = result.content[0].content || [];
    const noteLink = content.find((c: JSONContent) => c.type === 'noteLink');
    const image = content.find((c: JSONContent) => c.type === 'image');
    expect(noteLink).toBeTruthy();
    expect(image).toBeTruthy();
  });

  test('空の文字列をパースする', () => {
    const result = parseMarkdownWithNoteLinks('');
    expect(result.type).toBe('doc');
    expect(result.content).toHaveLength(1);
    expect(result.content[0].type).toBe('paragraph');
  });

  test('複数のnoteLinkをパースする', () => {
    const result = parseMarkdownWithNoteLinks('[[Note1]] and [[Note2]]');
    expect(result.type).toBe('doc');
    const content = result.content[0].content || [];
    const noteLinks = content.filter((c: JSONContent) => c.type === 'noteLink');
    expect(noteLinks).toHaveLength(2);
  });
});
