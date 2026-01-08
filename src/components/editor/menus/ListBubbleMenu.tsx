import { findParentNode, posToDOMRect, type Editor } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import { useTranslation } from '@/hooks/useTranslation';

type ListBubbleMenuProps = {
  editor: Editor;
};

export function ListBubbleMenu({ editor }: ListBubbleMenuProps) {
  const { t } = useTranslation('editor');

  return (
    <BubbleMenu
      editor={editor}
      shouldShow={() => editor.isActive('bulletList') || editor.isActive('orderedList')}
      getReferencedVirtualElement={() => {
        const parentNode = findParentNode(
          node => node.type.name === 'bulletList' || node.type.name === 'orderedList'
        )(editor.state.selection);
        if (parentNode) {
          const domRect = posToDOMRect(
            editor.view,
            parentNode.start,
            parentNode.start + parentNode.node.nodeSize
          );
          return {
            getBoundingClientRect: () => domRect,
            getClientRects: () => [domRect]
          };
        }
        return null;
      }}
      options={{ placement: 'top-start', offset: 8 }}>
      <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow flex p-0.5 gap-1">
        <button
          onClick={() => {
            const chain = editor.chain().focus();
            if (editor.isActive('bulletList')) {
              chain.toggleOrderedList();
            } else {
              chain.toggleBulletList();
            }
            chain.run();
          }}
          type="button">
          {t('toolbar.toggleListType')}
        </button>
      </div>
    </BubbleMenu>
  );
}
