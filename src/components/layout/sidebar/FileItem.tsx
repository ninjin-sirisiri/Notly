import { useFolderStore } from '@/stores/folders';
import { type FileItem as FileItemType } from '@/types/files';

import { FolderItem } from './FolderItem';
import { NoteItem } from './NoteItem';

export function FileItem({ item }: { item: FileItemType }) {
  const { setCurrentFolder, currentFolder } = useFolderStore();

  if ('folder' in item) {
    return (
      <FolderItem
        folder={item.folder}
        FileItemComponent={FileItem}
        onClick={() => setCurrentFolder(item.folder)}
        isActive={currentFolder?.id === item.folder.id}
      />
    );
  }
  if ('note' in item) {
    return <NoteItem note={item.note} />;
  }
  return null;
}
