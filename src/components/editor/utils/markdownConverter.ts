import { type JSONContent, type useEditor } from '@tiptap/react';

/**
 * JSONをMarkdownに変換する際、noteLinkノードを[[]]形式に変換
 */
export function processNode(node: JSONContent): string {
  if (node.type === 'noteLink') {
    const noteName = node.attrs?.noteName || '';
    return `[[${noteName}]]`;
  }

  if (node.type === 'text') {
    return node.text || '';
  }

  if (node.content) {
    // contentを処理する前に、noteLinkノードの前後の[[と]]を削除
    const filteredContent = node.content.filter((child: JSONContent, index: number) => {
      // noteLinkの直前の[[を除去
      if (
        child.type === 'text' &&
        child.text === '[[' &&
        index < (node.content?.length || 0) - 1 &&
        node.content?.[index + 1].type === 'noteLink'
      ) {
        return false;
      }
      // noteLinkの直後の]]を除去
      if (
        child.type === 'text' &&
        child.text === ']]' &&
        index > 0 &&
        node.content?.[index - 1].type === 'noteLink'
      ) {
        return false;
      }
      return true;
    });

    const contentText = filteredContent.map((child: JSONContent) => processNode(child)).join('');

    // ノードタイプに応じてフォーマット
    switch (node.type) {
      case 'paragraph':
        return `${contentText}\n\n`;
      case 'heading':
        return `${'#'.repeat(node.attrs?.level || 1)} ${contentText}\n\n`;
      case 'bulletList':
        return contentText;
      case 'orderedList':
        return contentText;
      case 'listItem':
        return `- ${contentText.trim()}\n`;
      case 'codeBlock':
        return `\`\`\`\n${contentText}\`\`\`\n\n`;
      case 'blockquote':
        return `> ${contentText.trim()}\n\n`;
      case 'hardBreak':
        return '\n';
      default:
        return contentText;
    }
  }

  return '';
}

/**
 * NoteLinkノードを含むMarkdownを取得する関数
 */
export function getNoteLinkMarkdown(editor: ReturnType<typeof useEditor>) {
  if (!editor) return '';

  const json = editor.getJSON();
  return processNode(json).trim();
}

/**
 * Markdownテキストを[[]]を含むJSONContentに変換
 */
export function parseMarkdownWithNoteLinks(content: string): JSONContent {
  const lines = content.split('\n\n');
  const docContent: JSONContent[] = [];

  for (const line of lines) {
    if (!line.trim()) continue;

    const paragraphContent: JSONContent[] = [];
    let remaining = line;
    const regex = /\[\[([^\]]+)\]\]/g;
    let lastIndex = 0;
    let match;

    while ((match = regex.exec(remaining)) !== null) {
      // マッチの前のテキスト
      if (match.index > lastIndex) {
        const beforeText = remaining.slice(lastIndex, match.index);
        if (beforeText) {
          paragraphContent.push({
            type: 'text',
            text: beforeText
          });
        }
      }

      // NoteLinkノード
      paragraphContent.push({
        type: 'noteLink',
        attrs: { noteName: match[1] }
      });

      lastIndex = match.index + match[0].length;
    }

    // 残りのテキスト
    if (lastIndex < remaining.length) {
      const afterText = remaining.slice(lastIndex);
      if (afterText) {
        paragraphContent.push({
          type: 'text',
          text: afterText
        });
      }
    }

    if (paragraphContent.length > 0) {
      docContent.push({
        type: 'paragraph',
        content: paragraphContent
      });
    }
  }

  // 空のドキュメントの場合
  if (docContent.length === 0) {
    docContent.push({ type: 'paragraph' });
  }

  return { type: 'doc', content: docContent };
}
