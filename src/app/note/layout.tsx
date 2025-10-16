import { NotesProvider } from '@/context/notes-context';
import { WindowLayout } from './components/layout';
import { StatsProvider } from '@/context/stats-context';

export default function NoteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <NotesProvider>
      <StatsProvider>
        <WindowLayout>{children}</WindowLayout>
      </StatsProvider>
    </NotesProvider>
  );
}
