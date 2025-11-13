import { Search } from 'lucide-react';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { useFileStore } from '@/stores/files';

export function FileSearch() {
  const { setSearchQuery } = useFileStore();
  const [localQuery, setLocalQuery] = useState('');

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target;
    setLocalQuery(value);
    setSearchQuery(value);
  }

  return (
    <div className="relative grow">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      <Input
        className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark pl-9 pr-3 py-1.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-1 focus:ring-primary dark:focus:ring-white h-8"
        placeholder="ノートを検索..."
        type="search"
        value={localQuery}
        onChange={handleChange}
      />
    </div>
  );
}
