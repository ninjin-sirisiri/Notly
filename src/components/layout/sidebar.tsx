import {
  X,
  Search,
  FileText,
  FolderPlus,
  Folder,
  Edit2,
  Trash2
} from 'lucide-react';

export function Sidebar({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-64 md:w-64 shrink-0
        border-r border-[#EAEAEA] dark:border-[#333333]
        bg-white dark:bg-[#1A1A1A]
        p-2 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}
      >
        <button
          onClick={onClose}
          className="md:hidden absolute top-2 right-2 p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <X className="h-5 w-5 text-[#666666]" />
        </button>

        <div className="flex flex-col gap-4">
          <div className="px-2 pt-2 flex flex-col gap-2">
            <div className="relative grow">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
              <input
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-background-light dark:bg-background-dark pl-9 pr-3 py-1.5 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-1 focus:ring-primary dark:focus:ring-white h-8"
                placeholder="フォルダを検索..."
                type="search"
              />
            </div>
          </div>
          <div className="px-2 flex items-center gap-2">
            <button className="flex-1 flex items-center justify-center gap-1.5 rounded-md h-8 bg-gray-200 dark:bg-gray-700 text-primary dark:text-white text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600">
              <FileText className="h-4 w-4" />
              ノート
            </button>
            <button className="flex-1 flex items-center justify-center gap-1.5 rounded-md h-8 bg-gray-200 dark:bg-gray-700 text-primary dark:text-white text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600">
              <FolderPlus className="h-4 w-4" />
              フォルダ
            </button>
          </div>
          <div className="overflow-y-auto">
            <div className="space-y-0.5 pt-2">
              <a
                className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded bg-gray-200 dark:bg-gray-700 text-primary dark:text-white group relative"
                href="#"
              >
                <Folder className="h-4 w-4" />
                <p className="text-sm font-medium">仕事</p>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </a>
              <div className="pl-4 relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
                <div className="space-y-0.5 relative">
                  <a
                    className="flex items-center gap-2 pl-6 pr-2 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700/50 text-primary dark:text-white group relative"
                    href="#"
                  >
                    <FileText className="h-4 w-4" />
                    <p className="text-sm font-medium truncate">
                      プロジェクトAの議事録
                    </p>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </a>
                  <a
                    className="flex items-center gap-2 pl-6 pr-2 py-1.5 rounded bg-gray-300/50 dark:bg-gray-600/50 text-primary dark:text-white group relative"
                    href="#"
                  >
                    <p className="text-sm font-medium truncate">
                      新しいUIデザインの草案
                    </p>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded hover:bg-gray-400/50 dark:hover:bg-gray-500/50">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-400/50 dark:hover:bg-gray-500/50">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </a>
                  <a
                    className="flex items-center gap-2 pl-6 pr-2 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700/50 text-primary dark:text-white group relative"
                    href="#"
                  >
                    <FileText className="h-4 w-4" />
                    <p className="text-sm font-medium truncate">
                      クライアントへのメール下書き
                    </p>
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </a>
                </div>
              </div>
              <a
                className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700/50 text-primary dark:text-white group relative"
                href="#"
              >
                <Folder className="h-4 w-4" />
                <p className="text-sm font-medium">プライベート</p>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </a>
              <a
                className="flex items-center gap-2 pl-2 pr-2 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700/50 text-primary dark:text-white group relative"
                href="#"
              >
                <Folder className="h-4 w-4" />
                <p className="text-sm font-medium">アイデア</p>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
