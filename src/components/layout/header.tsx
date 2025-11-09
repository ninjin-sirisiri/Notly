import { Flame, Menu, Settings } from 'lucide-react';

export function Header({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-solid border-[#EAEAEA] dark:border-[#333333] px-3 md:px-6 py-3 shrink-0">
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={onMenuClick}
          className="flex md:hidden items-center justify-center rounded-lg h-10 w-10 text-[#666666] hover:bg-gray-200 dark:hover:bg-[#333333]">
          <Menu className="h-5 w-5" />
        </button>
        <div className="size-5 md:size-6 text-primary dark:text-white">
          <img
            src="logo.png"
            alt="logo"
          />
        </div>
        <h1 className="text-base md:text-lg font-bold text-primary dark:text-white">Notly</h1>
      </div>
      <div className="flex items-center justify-between gap-2 md:gap-4">
        <div className="flex items-center gap-1 md:gap-1.5 rounded-full bg-orange-100 dark:bg-orange-900/50 px-2 md:px-3 py-1">
          <Flame className="h-4 w-4 text-orange-500 dark:text-orange-400" />
          <p className="hidden sm:block text-sm font-medium text-orange-600 dark:text-orange-300">
            継続 35 日目
          </p>
          <p className="sm:hidden text-sm font-medium text-orange-600 dark:text-orange-300">35</p>
        </div>
      </div>
      <button className="flex items-center justify-center rounded-lg h-8 w-8 md:h-10 md:w-10 text-[#666666] hover:bg-gray-200 dark:hover:bg-[#333333]">
        <Settings className="h-5 w-5 md:h-6 md:w-6" />
      </button>
    </header>
  );
}
