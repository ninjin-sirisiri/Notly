import { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import { exit } from '@tauri-apps/plugin-process';

import { useNoteStore } from '@/stores/notes';

import { Editor } from '@/components/editor';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { TitleBar } from '@/components/layout/title-bar';

import './App.css';
import { ThemeProvider } from './components/theme/theme-provider';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { setCurrentNote } = useNoteStore();

  useHotkeys('ctrl+b, cmd+b', e => {
    e.preventDefault();
    setIsSidebarOpen(prev => !prev);
  });

  useHotkeys('ctrl+q, cmd+q', e => {
    e.preventDefault();
    exit();
  });

  useHotkeys('ctrl+w, cmd+w', e => {
    e.preventDefault();
    setCurrentNote(null);
  });

  useHotkeys('ctrl+s, cmd+s', e => {
    e.preventDefault();
    toast.success('Saved');
  });

  useHotkeys('ctrl+,', e => {
    e.preventDefault();
    toast.info('Settings not implemented yet');
  });

  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="vite-ui-theme">
      <div className="flex h-screen w-full flex-col font-sans text-[#1A1A1A] dark:text-[#F8F8F8]">
        <TitleBar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            <Editor />
          </div>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
