import { type JSONContent, type useEditor } from '@tiptap/react';

/**
 * JSONをMarkdownに変換する際、noteLinkノードを[[]]形式に変換
 */
export function processNode(node: JSONContent): string {
  if (node.type === 'noteLink') {
    const noteName = node.attrs?.noteName || '';
    return `[[${noteName}]]`;
  }

  if (node.type === 'image') {
    return `![${node.attrs?.alt || ''}](${node.attrs?.src})`;
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

    while (remaining.length > 0) {
      const imageMatch = /!\[([^\]]*)\]\(([^)]+)\)/.exec(remaining);
      const linkMatch = /\[\[([^\]]+)\]\]/.exec(remaining);

      let matchType = 'none';
      let matchIndex = -1;
      let matchLength = 0;
      let matchData: { alt?: string; src?: string; name?: string } = {};

      if (imageMatch && linkMatch) {
        if (imageMatch.index < linkMatch.index) {
          matchType = 'image';
          matchIndex = imageMatch.index;
          matchLength = imageMatch[0].length;
          matchData = { alt: imageMatch[1], src: imageMatch[2] };
        } else {
          matchType = 'link';
          matchIndex = linkMatch.index;
          matchLength = linkMatch[0].length;
          matchData = { name: linkMatch[1] };
        }
      } else if (imageMatch) {
        matchType = 'image';
        matchIndex = imageMatch.index;
        matchLength = imageMatch[0].length;
        matchData = { alt: imageMatch[1], src: imageMatch[2] };
      } else if (linkMatch) {
        matchType = 'link';
        matchIndex = linkMatch.index;
        matchLength = linkMatch[0].length;
        matchData = { name: linkMatch[1] };
      } else {
        // No matches
        paragraphContent.push({ type: 'text', text: remaining });
        remaining = '';
        break;
      }

      // Add text before match
      if (matchIndex > 0) {
        paragraphContent.push({ type: 'text', text: remaining.slice(0, matchIndex) });
      }

      // Add match
      if (matchType === 'image') {
        paragraphContent.push({
          type: 'image',
          attrs: { src: matchData.src, alt: matchData.alt }
        });
      } else if (matchType === 'link') {
        paragraphContent.push({
          type: 'noteLink',
          attrs: { noteName: matchData.name }
        });
      }

      remaining = remaining.slice(matchIndex + matchLength);
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
