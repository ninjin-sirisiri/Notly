import { BarChart3, Flame, Menu, Settings } from 'lucide-react';
import { useEffect } from 'react';
import { useStreakStore } from '../../stores/streak';
import { ModeToggle } from '../theme/ModeToggle';

export function Header({
  onMenuClick,
  onSettingsClick,
  onActivityClick
}: {
  onMenuClick: () => void;
  onSettingsClick?: () => void;
  onActivityClick?: () => void;
}) {
  const { streak, fetchStreak } = useStreakStore();

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-border px-3 md:px-6 py-3 shrink-0 bg-background">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onMenuClick}
          className="flex md:hidden items-center justify-center rounded-lg h-10 w-10 text-muted-foreground hover:bg-accent">
          <Menu className="h-5 w-5" />
        </button>
        <div className="size-5 md:size-6 text-primary">
          <img
            src="logo.png"
            alt="logo"
          />
        </div>
        <h1 className="text-base md:text-lg font-bold text-foreground">Notly</h1>
      </div>
      <div className="flex items-center justify-between gap-2 md:gap-4">
        <button
          onClick={onActivityClick}
          className="flex items-center gap-1 md:gap-1.5 rounded-full bg-orange-100 dark:bg-orange-900/50 px-2 md:px-3 py-1 hover:bg-orange-200 dark:hover:bg-orange-900/70 transition-colors cursor-pointer">
          <Flame className="h-4 w-4 text-orange-500 dark:text-orange-400" />
          <p className="hidden sm:block text-sm font-medium text-orange-600 dark:text-orange-300">
            継続 {streak} 日目
          </p>
          <p className="sm:hidden text-sm font-medium text-orange-600 dark:text-orange-300">
            {streak}
          </p>
        </button>
      </div>
      <div className="flex items-center justify-between gap-2 md:gap-4">
        <button
          onClick={onActivityClick}
          className="flex items-center justify-center rounded-lg h-8 w-8 md:h-10 md:w-10 text-muted-foreground hover:bg-accent"
          title="アクティビティ">
          <BarChart3 className="h-5 w-5 md:h-6 md:w-6" />
        </button>
        <ModeToggle />
        <button
          onClick={onSettingsClick}
          className="flex items-center justify-center rounded-lg h-8 w-8 md:h-10 md:w-10 text-muted-foreground hover:bg-accent">
          <Settings className="h-5 w-5 md:h-6 md:w-6" />
        </button>
      </div>
    </header>
  );
}
