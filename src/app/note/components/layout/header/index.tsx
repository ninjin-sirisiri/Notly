'use client';

import { ThemeToggle } from '@/components/theme/theme-toggle';
import { Logo } from './logo';
import { SettingButton } from './setting-button';
import { Streak } from './streak';

export function Header() {
  return (
    <div className="flex items-center justify-between h-[80px] px-4 py-2 bg-card border-b sticky">
      <Logo />
      <Streak />
      <div className="flex items-center justify-center gap-2">
        <ThemeToggle />
        <SettingButton />
      </div>
    </div>
  );
}
