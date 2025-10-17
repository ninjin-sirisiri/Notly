'use client';

import { FolderTree } from './folder-tree';
import { Header } from './header';

export function WindowLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <FolderTree />
        {children}
      </div>
    </div>
  );
}
