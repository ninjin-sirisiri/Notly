import { getCurrentWindow } from '@tauri-apps/api/window';
import { X, Minus, Square } from 'lucide-react';

export function TitleBar() {
  const appWindow = getCurrentWindow();

  return (
    <div
      className="flex items-center justify-between bg-gray-900 text-white h-8 px-2 select-none"
      data-tauri-drag-region
    >
      <div>
        <img
          src="public/logo.png"
          alt="logo"
          width={20}
        />
      </div>
      <div className="flex space-x-2">
        <button
          className="hover:bg-accent/50 p-2 rounded"
          onClick={() => appWindow.minimize()}
        >
          <Minus size={14} />
        </button>
        <button
          className="hover:bg-accent/50 p-2 rounded"
          onClick={() => {
            appWindow.toggleMaximize();
            console.log('Maximize toggled');
          }}
        >
          <Square size={12} />
        </button>
        <button
          className="hover:bg-red-500 p-2 rounded"
          onClick={() => appWindow.close()}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
