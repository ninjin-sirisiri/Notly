import { FolderPlus } from 'lucide-react';

export function CreateFolderButton() {
  return (
    <button className="flex-1 flex items-center justify-center gap-1.5 rounded-md h-8 bg-gray-200 dark:bg-gray-700 text-primary dark:text-white text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600">
      <FolderPlus className="h-4 w-4" />
      フォルダ
    </button>
  );
}
