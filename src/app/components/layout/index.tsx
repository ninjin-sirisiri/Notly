import { FolderTree } from './folder-tree';
import { Header } from './header';

export function WindowLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex flex-col max-h-screen">
      <Header />
      <div className="flex h-screen">
        <FolderTree />
        {children}
      </div>
    </div>
  );
}
