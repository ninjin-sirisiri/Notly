import { memo } from 'react';
import { useFolderStore } from '@/stores/folders';
import { type FileItem as FileItemType } from '@/types/files';

import { FolderItem } from './FolderItem';
import { NoteItem } from './NoteItem';

export const FileItem = memo(function FileItem({ item }: { item: FileItemType }) {
  const setCurrentFolder = useFolderStore(state => state.setCurrentFolder);

  if ('folder' in item) {
    return (
      <FolderItem
        folder={item.folder}
        FileItemComponent={FileItem}
        onClick={() => setCurrentFolder(item.folder)}
      />
    );
  }
  if ('note' in item) {
    return <NoteItem note={item.note} />;
  }
  return null;
});
