import { Minus, Square, X } from 'lucide-react';
import { toast } from 'sonner';

import { getCurrentWindow } from '@tauri-apps/api/window';

export function TitleBar() {
  const appWindow = getCurrentWindow();

  return (
    <div
      className="flex items-center justify-between bg-background text-foreground border-b border-border h-8 px-2 select-none"
      data-tauri-drag-region>
      <div>
        <img
          src="logo.png"
          alt="logo"
          width={20}
        />
      </div>
      <div className="flex space-x-2">
        <button
          className="hover:bg-accent/50 p-2 rounded"
          onClick={() => appWindow.minimize()}>
          <Minus size={14} />
        </button>
        <button
          className="hover:bg-accent/50 p-2 rounded"
          onClick={() => {
            appWindow.toggleMaximize();
            toast.info('Maximize toggled');
          }}>
          <Square size={12} />
        </button>
        <button
          className="hover:bg-red-500 p-2 rounded"
          onClick={() => appWindow.close()}>
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
