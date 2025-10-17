'use client';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useLayoutContext } from '@/context/layout-context';
import { Logo } from './logo';
import { SettingButton } from './setting-button';
import { Streak } from './streak';

export function Header() {
  const { isFolderTreeOpen, setIsFolderTreeOpen } = useLayoutContext();
  return (
    <div className="flex items-center justify-between h-[80px] px-4 py-2 bg-card border-b sticky">
      <div className="flex items-center gap-2">
        <button className="md:hidden" onClick={() => setIsFolderTreeOpen(!isFolderTreeOpen)}>
          Menu
        </button>
        <Logo />
      </div>
      <Streak />
      <div className="flex items-center justify-center gap-2">
        <ThemeToggle />
        <SettingButton />
      </div>
    </div>
  );
}
