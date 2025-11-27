import { useState, useEffect } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import { exit } from '@tauri-apps/plugin-process';

import { checkInitialization } from '@/lib/api/app';
import { useNoteStore } from '@/stores/notes';
import { useTemplateStore } from '@/stores/templates';

import { Editor } from '@/components/editor';
import { TemplateEditor } from '@/components/editor/TemplateEditor';
import { InitializationScreen } from '@/components/InitializationScreen';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { TitleBar } from '@/components/layout/title-bar';
import { SettingsPage } from '@/components/settings/SettingsPage';

import './App.css';
import { ThemeProvider } from './components/theme/theme-provider';
import { Toaster } from './components/ui/sonner';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { setCurrentNote } = useNoteStore();
  const { isTemplateEditorOpen } = useTemplateStore();

  useEffect(() => {
    async function checkInit() {
      try {
        const initialized = await checkInitialization();
        setIsInitialized(initialized);
      } catch {
        setIsInitialized(false);
      }
    }
    checkInit();
  }, []);

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
    setIsSettingsOpen(prev => !prev);
  });

  if (isInitialized === null) {
    return (
      <ThemeProvider
        defaultTheme="system"
        storageKey="vite-ui-theme">
        <div className="flex h-screen w-full items-center justify-center">
          <div className="text-muted-foreground">読み込み中...</div>
        </div>
      </ThemeProvider>
    );
  }

  if (!isInitialized) {
    return (
      <ThemeProvider
        defaultTheme="system"
        storageKey="vite-ui-theme">
        <InitializationScreen onInitialized={() => setIsInitialized(true)} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider
      defaultTheme="system"
      storageKey="vite-ui-theme">
      <div className="flex h-screen w-full flex-col font-sans text-[#1A1A1A] dark:text-[#F8F8F8]">
        <TitleBar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <Header
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
            onSettingsClick={() => setIsSettingsOpen(!isSettingsOpen)}
          />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            {(() => {
              if (isSettingsOpen) return <SettingsPage />;
              if (isTemplateEditorOpen) return <TemplateEditor />;
              return <Editor />;
            })()}
          </div>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
