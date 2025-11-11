import { useEffect } from 'react';

import { useFileStore } from '@/stores/files';

export function useFiles() {
  const { files, isLoading, error, loadFiles } = useFileStore();

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  return {
    error,
    isLoading,
    loadFiles,
    files
  };
}
