import { NotesProvider } from '@/context/notes-context';
import { WindowLayout } from './components/layout';
import { StatsProvider } from '@/context/stats-context';
import { LayoutProvider } from '@/context/layout-context';

export default function NoteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <NotesProvider>
      <StatsProvider>
        <LayoutProvider>
          <WindowLayout>{children}</WindowLayout>
        </LayoutProvider>
      </StatsProvider>
    </NotesProvider>
  );
}
