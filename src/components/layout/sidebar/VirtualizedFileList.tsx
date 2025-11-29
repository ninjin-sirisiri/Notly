import { memo, useMemo } from 'react';
import { Virtuoso } from 'react-virtuoso';
import { useFiles } from '@/hooks/useFiles';
import { useFolderStore } from '@/stores/folders';
import { FileItem } from './tree/FileItem';
import { flattenFiles } from './utils/flatten';

export const VirtualizedFileList = memo(function VirtualizedFileList() {
  const { files } = useFiles();
  const openFolderIds = useFolderStore(state => state.openFolderIds);

  const flattenedItems = useMemo(() => flattenFiles(files, openFolderIds), [files, openFolderIds]);

  return (
    <Virtuoso
      style={{ height: '100%' }}
      totalCount={flattenedItems.length}
      itemContent={index => {
        const flatItem = flattenedItems[index];
        return (
          <div style={{ paddingLeft: `${flatItem.depth * 16}px` }}>
            <FileItem item={flatItem.item} />
          </div>
        );
      }}
      overscan={10}
    />
  );
});
