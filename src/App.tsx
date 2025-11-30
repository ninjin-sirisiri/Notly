import { useState, useEffect, lazy, Suspense } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'sonner';
import { exit } from '@tauri-apps/plugin-process';

import { checkInitialization } from '@/lib/api/app';
import { useNoteStore } from '@/stores/notes';
import { useSettingsStore } from '@/stores/settings';
import { useTemplateStore } from '@/stores/templates';

import { InitializationScreen } from '@/components/InitializationScreen';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { TitleBar } from '@/components/layout/title-bar';

import './App.css';
import { ThemeProvider } from './components/theme/theme-provider';
import { Toaster } from './components/ui/sonner';

import { listen } from '@tauri-apps/api/event';

function LoadingFallback() {
  return (
    <div className="flex-1 flex items-center justify-center text-muted-foreground">
      読み込み中...
    </div>
  );
}

const fallbackElement = <LoadingFallback />;

const Editor = lazy(async () => {
  const module = await import('@/components/editor');
  return { default: module.Editor };
});

const TemplateEditor = lazy(async () => {
  const module = await import('@/components/editor/TemplateEditor');
  return { default: module.TemplateEditor };
});

const SettingsPage = lazy(async () => {
  const module = await import('@/components/settings/SettingsPage');
  return { default: module.SettingsPage };
});

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState<boolean | null>(null);
  const { setCurrentNote, createNote } = useNoteStore();
  const { isTemplateEditorOpen } = useTemplateStore();
  const { isSettingsOpen, toggleSettings } = useSettingsStore();

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

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    let ignore = false;

    async function setupListener() {
      const unlistenFn = await listen('open-quick-note', () => {
        toast.success('Quick Note Shortcut Detected');
        createNote('Untitled', '', '', null);
        // Ensure settings and template editor are closed
        useSettingsStore.getState().setSettingsOpen(false);
        useTemplateStore.getState().setTemplateEditorOpen(false);
      });

      if (ignore) {
        unlistenFn();
      } else {
        unlisten = unlistenFn;
      }
    }

    setupListener();

    return () => {
      ignore = true;
      if (unlisten) {
        unlisten();
      }
    };
  }, [createNote]);

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
    toggleSettings();
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
            onSettingsClick={toggleSettings}
          />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
            <Suspense fallback={fallbackElement}>
              {(() => {
                if (isSettingsOpen) return <SettingsPage />;
                if (isTemplateEditorOpen) return <TemplateEditor />;
                return <Editor />;
              })()}
            </Suspense>
          </div>
        </div>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}
