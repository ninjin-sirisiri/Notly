import { type FileItem } from '@/types/files';

export type FlattenedItem = {
  item: FileItem;
  depth: number;
  index: number;
};

export function flattenFiles(
  files: FileItem[],
  openFolderIds: number[],
  depth = 0,
  result: FlattenedItem[] = []
): FlattenedItem[] {
  for (const file of files) {
    result.push({
      item: file,
      depth,
      index: result.length
    });

    if ('folder' in file && openFolderIds.includes(file.folder.id) && file.folder.children) {
      flattenFiles(file.folder.children, openFolderIds, depth + 1, result);
    }
  }
  return result;
}
