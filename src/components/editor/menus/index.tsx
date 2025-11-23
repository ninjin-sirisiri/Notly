import { type Editor } from '@tiptap/react';

import { EditorFloatingMenu } from './EditorFloatingMenu';
import { ListBubbleMenu } from './ListBubbleMenu';
import { TextBubbleMenu } from './TextBubbleMenu';

type BubbleMenusProps = {
  editor: Editor | null;
};

/**
 * BubbleMenuとFloatingMenuのコンポーネント
 */
export function BubbleMenus({ editor }: BubbleMenusProps) {
  if (!editor) return null;

  return (
    <>
      <TextBubbleMenu editor={editor} />
      <ListBubbleMenu editor={editor} />
      <EditorFloatingMenu editor={editor} />
    </>
  );
}
