import { useEffect } from 'react';

import { useFileStore } from '@/stores/files';

export function useFiles() {
  const isLoading = useFileStore(state => state.isLoading);
  const error = useFileStore(state => state.error);
  const loadFiles = useFileStore(state => state.loadFiles);
  const filteredFiles = useFileStore(state => state.filteredFiles);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  return {
    error,
    isLoading,
    loadFiles,
    files: filteredFiles
  };
}
