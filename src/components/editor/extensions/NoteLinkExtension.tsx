import { Node, mergeAttributes, nodePasteRule, nodeInputRule } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export type NoteLinkOptions = {
  HTMLAttributes: Record<string, unknown>;
  onLinkClick?: (noteName: string) => void;
};

declare module '@tiptap/core' {
  // eslint-disable-next-line typescript/consistent-type-definitions -- Tiptapのモジュール拡張ではinterfaceが必須
  interface Commands<ReturnType> {
    noteLink: {
      /**
       * Insert a note link
       */
      insertNoteLink: (noteName: string) => ReturnType;
    };
  }
}

// [[ノート名]] のパターンにマッチする正規表現
const NOTE_LINK_REGEX = /\[\[([^\]]+)\]\]/g;
const NOTE_LINK_INPUT_REGEX = /\[\[([^\]]+)\]\]$/;

export const NoteLinkExtension = Node.create<NoteLinkOptions>({
  name: 'noteLink',

  group: 'inline',

  inline: true,

  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      onLinkClick: undefined
    };
  },

  addStorage() {
    return {
      markdown: {
        serialize(state: { text: (text: string) => void }, node: { attrs: { noteName: string } }) {
          state.text(`[[${node.attrs.noteName}]]`);
        },
        parse: {
          // parseはinputRulesとpasteRulesで処理
        }
      }
    };
  },

  addAttributes() {
    return {
      noteName: {
        default: null,
        parseHTML: element => {
          const htmlElement = element as HTMLElement;
          return htmlElement.dataset.noteName;
        },
        renderHTML: attributes => {
          if (!attributes.noteName) {
            return {};
          }
          return {
            'data-note-name': attributes.noteName
          };
        }
      }
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-note-link]',
        getAttrs: element => {
          const htmlElement = element as HTMLElement;
          const noteName = htmlElement.dataset.noteName;
          return noteName ? { noteName } : false;
        }
      }
    ];
  },

  renderHTML({ HTMLAttributes, node }) {
    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-note-link': '',
        class:
          'note-link cursor-pointer text-blue-600 dark:text-blue-400 hover:underline font-medium'
      }),
      node.attrs.noteName
    ];
  },

  renderText({ node }) {
    return `[[${node.attrs.noteName}]]`;
  },

  addCommands() {
    return {
      insertNoteLink:
        (noteName: string) =>
        ({ commands }) =>
          commands.insertContent({
            type: this.name,
            attrs: { noteName }
          })
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: NOTE_LINK_INPUT_REGEX,
        type: this.type,
        getAttributes: match => ({ noteName: match[1] })
      })
    ];
  },

  addPasteRules() {
    return [
      nodePasteRule({
        find: NOTE_LINK_REGEX,
        type: this.type,
        getAttributes: match => ({ noteName: match[1] })
      })
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('noteLinkClick'),
        props: {
          handleClick: (_view, _pos, event) => {
            const target = event.target as HTMLElement;

            // note-link クラスを持つ要素またはその親要素をチェック
            const linkElement = target.closest('[data-note-link]') as HTMLElement | null;

            if (linkElement) {
              event.preventDefault();
              const { noteName } = linkElement.dataset;

              if (noteName && this.options.onLinkClick) {
                this.options.onLinkClick(noteName);
              }
              return true;
            }

            return false;
          }
        }
      })
    ];
  }
});
