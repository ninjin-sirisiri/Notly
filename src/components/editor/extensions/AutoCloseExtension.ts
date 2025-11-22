import { Extension, type Editor } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

export const AutoCloseExtension = Extension.create({
  name: 'autoClose',

  addKeyboardShortcuts() {
    const openToClose: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`'
    };

    const closeToOpen: Record<string, string> = {
      ')': '(',
      ']': '[',
      '}': '{',
      '"': '"',
      "'": "'",
      '`': '`'
    };

    const shortcuts: Record<string, (props: { editor: Editor }) => boolean> = {};

    // Handle opening characters
    for (const [open, close] of Object.entries(openToClose)) {
      shortcuts[open] = ({ editor }) => {
        const { selection, doc } = editor.state;
        const { empty, head, from, to } = selection;

        // If selection is not empty, wrap the selection
        if (!empty) {
          editor

            .chain()

            .focus()

            .insertContentAt(from, open)

            .insertContentAt(to + 1, close)

            .setTextSelection({ from: from + 1, to: to + 1 })

            .run();
          return true;
        }

        // If it's a quote or backtick, check if we should skip instead of open
        // This handles the case where the user types the closing quote to "move over" it
        if (open === close) {
          const nextChar = doc.textBetween(head, head + 1);
          if (nextChar === close) {
            editor.commands.setTextSelection(head + 1);
            return true;
          }
        }

        // Insert the pair and place cursor in between using a direct transaction
        return editor.commands.command(({ tr, dispatch }) => {
          if (dispatch) {
            tr.insertText(`${open}${close}`, from, to);
            tr.setSelection(TextSelection.create(tr.doc, from + open.length));
          }
          return true;
        });
      };
    }

    // Handle closing characters (only for those that are strictly closing, not quotes)
    for (const close of Object.keys(closeToOpen)) {
      // Skip if it is also an opening character (quotes/backticks) as they are handled above
      if (openToClose[close]) continue;

      shortcuts[close] = ({ editor }) => {
        const { selection, doc } = editor.state;
        const { empty, head } = selection;

        if (!empty) return false;

        const nextChar = doc.textBetween(head, head + 1);
        if (nextChar === close) {
          editor.commands.setTextSelection(head + 1);
          return true;
        }
        return false;
      };
    }

    // Handle Backspace to delete the pair if empty
    shortcuts['Backspace'] = ({ editor }) => {
      const { selection, doc } = editor.state;
      const { empty, head } = selection;

      if (!empty) return false;

      const prevChar = doc.textBetween(head - 1, head);
      const nextChar = doc.textBetween(head, head + 1);

      if (openToClose[prevChar] === nextChar) {
        editor

          .chain()

          .focus()

          .deleteRange({ from: head - 1, to: head + 1 })

          .run();
        return true;
      }

      return false;
    };

    return shortcuts;
  }
});
