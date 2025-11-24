import tippy, { type Instance as TippyInstance } from 'tippy.js';
import { useFolderStore } from '@/stores/folders';
import { useNoteStore } from '@/stores/notes';
import { Node, mergeAttributes, nodePasteRule, nodeInputRule } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { ReactRenderer } from '@tiptap/react';
import { Suggestion as SuggestionPlugin } from '@tiptap/suggestion';
import { SuggestionList, type SuggestionListRef, type SuggestionItem } from '../SuggestionList';

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
    const noteName = node.attrs.noteName as string;
    const displayTitle = noteName.split(/[/\\]/).pop() || noteName;

    return [
      'span',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-note-link': '',
        class:
          'note-link cursor-pointer text-blue-600 dark:text-blue-400 hover:underline font-medium',
        title: noteName
      }),
      displayTitle
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
      SuggestionPlugin({
        editor: this.editor,
        pluginKey: new PluginKey('noteLinkSuggestion'),
        char: '[[',
        items: ({ query }) => {
          const notes = useNoteStore.getState().notes;
          const folders = useFolderStore.getState().folders;

          const candidates: SuggestionItem[] = notes
            .filter(note => note.title.toLowerCase().includes(query.toLowerCase()))
            .map(note => {
              let path = '';
              if (note.parent_id) {
                const folder = folders.find(f => f.id === note.parent_id);
                if (folder) {
                  path = folder.name;
                }
              }
              return {
                title: note.title,
                path,
                id: note.id
              };
            })
            .slice(0, 5);

          const exactMatch = candidates.find(c => c.title === query && c.path === '');
          if (query && !exactMatch) {
            candidates.push({
              title: query,
              path: 'New Note',
              id: 'new'
            });
          } else if (candidates.length === 0) {
            candidates.push({
              title: 'New Note',
              path: '',
              id: 'new'
            });
          }

          return candidates;
        },
        render: () => {
          let component: ReactRenderer<SuggestionListRef>;
          let popup: TippyInstance[];

          return {
            onStart: props => {
              component = new ReactRenderer(SuggestionList, {
                props,
                editor: props.editor
              });

              if (!props.clientRect) {
                return;
              }

              popup = tippy('body', {
                getReferenceClientRect: () => props.clientRect?.() || new DOMRect(0, 0, 0, 0),
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: 'manual',
                placement: 'bottom-start'
              });
            },

            onUpdate(props) {
              component.updateProps(props);

              if (!props.clientRect) {
                return;
              }

              popup[0].setProps({
                getReferenceClientRect: () => props.clientRect?.() || new DOMRect(0, 0, 0, 0)
              });
            },

            onKeyDown(props) {
              if (props.event.key === 'Escape') {
                popup[0].hide();
                return true;
              }

              return component.ref?.onKeyDown(props) || false;
            },

            onExit() {
              popup[0].destroy();
              component.destroy();
            }
          };
        },
        command: ({ editor, range, props }) => {
          // Check if there is a closing bracket ']' after the cursor (from AutoClose)
          const afterText = editor.state.doc.textBetween(range.to, range.to + 1);
          const hasClosingBracket = afterText === ']';

          editor
            .chain()
            .focus()
            // Delete the trigger '[[' and the query
            .deleteRange(range)
            .insertContent({
              type: this.name,
              attrs: { noteName: props.noteName }
            })
            .command(({ tr }) => {
              if (hasClosingBracket) {
                // If we had ']' after, delete it to avoid duplication
                // We just inserted the node (atom), so the position has moved.
                // The node size is 1.
                // So we are at `range.from + 1`.
                // The ']' should be at `range.from + 1`.
                tr.delete(range.from + 1, range.from + 1 + 1);
              }
              return true;
            })
            .run();
        }
      }),
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
        },
        appendTransaction: (transactions, _oldState, newState) => {
          const docChanged = transactions.some(tr => tr.docChanged);
          if (!docChanged) return;

          const { doc, tr } = newState;
          const regex = /\[\[([^\]]+)\]\]/g;
          let hasMatch = false;

          doc.descendants((node, pos) => {
            if (!node.isText || !node.text) return;

            let match;
            while ((match = regex.exec(node.text)) !== null) {
              const start = pos + match.index;
              const end = start + match[0].length;
              const noteName = match[1];

              // Check if the match is already a noteLink (shouldn't happen in text node but good to be safe)
              // Actually, we are scanning text nodes, so we found text "[[...]]".
              // We need to replace this range with a noteLink node.

              // Ensure we don't replace if it's inside a code block or other non-linkable context if needed
              // For now, simple replacement.

              tr.replaceWith(start, end, this.type.create({ noteName }));
              hasMatch = true;
            }
          });

          if (hasMatch) return tr;
        }
      })
    ];
  }
});
