import { toast } from 'sonner';
import { invoke } from '@tauri-apps/api/core';
import { Image } from '@tiptap/extension-image';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const ImageExtension = Image.extend({
  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('imageUpload'),
        props: {
          handlePaste: (view, event) => {
            const items = [...(event.clipboardData?.items || [])];
            const imageItem = items.find(item => item.type.startsWith('image/'));

            if (imageItem) {
              event.preventDefault();
              const file = imageItem.getAsFile();
              if (file) {
                handleImageUpload(file, view);
              }
              return true;
            }
            return false;
          },
          handleDrop: (view, event) => {
            const hasFiles = event.dataTransfer?.files?.length;
            if (!hasFiles) return false;

            const images = [...event.dataTransfer.files].filter(file =>
              file.type.startsWith('image/')
            );

            if (images.length > 0) {
              event.preventDefault();
              for (const image of images) {
                handleImageUpload(image, view);
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handleImageUpload(file: File, view: any) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Get extension from file name or type
    const extension = file.name.split('.').pop() || file.type.split('/')[1] || 'png';

    const dataUrl = await invoke<string>('save_image', {
      imageData: [...uint8Array],
      extension
    });

    const { schema } = view.state;
    const node = schema.nodes.image.create({ src: dataUrl });
    const transaction = view.state.tr.replaceSelectionWith(node);
    view.dispatch(transaction);
  } catch {
    toast.error('Failed to upload image');
  }
}
