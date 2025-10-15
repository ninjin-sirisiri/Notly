import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Editor } from '@/app/note/[noteId]/components/editor';
import { Note } from '@/types/database';

// --- Mocks ---

// 1. Mock useNotes hook
const mockUpdateNote = vi.fn();
const mockCreateNote = vi.fn();
const mockNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Test Note Title',
    content: 'Test note content.',
    filePath: '',
    folderId: 'folder-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

vi.mock('@/hooks/useNotes', () => ({
  useNotes: () => ({
    notes: mockNotes,
    updateNote: mockUpdateNote,
    createNote: mockCreateNote,
    selectedFolderId: 'folder-1',
  }),
}));

// 2. Mock useRouter
const mockRouterPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}));

// 3. Mock child components
type MockMarkdownEditorProps = {
  content: string;
  setContent: (value: string) => void;
  onBlur: () => void;
};
vi.mock('@/app/note/[noteId]/components/markdown-editor', () => ({
  default: ({ content, setContent, onBlur }: MockMarkdownEditorProps) => (
    <textarea
      data-testid="markdown-editor"
      value={content}
      onChange={(e) => setContent(e.target.value)}
      onBlur={onBlur}
    />
  ),
}));

const mockOnSelectFolder = vi.fn();
type MockFolderSelectorDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelectFolder: (folderId: string) => void;
};
vi.mock('@/app/note/[noteId]/components/folder-selector-dialog', () => ({
  FolderSelectorDialog: ({ isOpen, onClose, onSelectFolder }: MockFolderSelectorDialogProps) => {
    mockOnSelectFolder.mockImplementation(onSelectFolder);
    if (!isOpen) return null;
    return (
      <div data-testid="folder-selector-dialog">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSelectFolder('selected-folder-id')}>Select Folder</button>
      </div>
    );
  },
}));

// --- Tests ---

describe('Editor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Existing Note', () => {
    it('should display the note title and content', () => {
      render(<Editor noteId="note-1" />);

      const titleInput = screen.getByDisplayValue('Test Note Title');
      const contentEditor = screen.getByTestId('markdown-editor');

      expect(titleInput).toBeInTheDocument();
      expect(contentEditor).toHaveValue('Test note content.');
    });

    it('should call updateNote on title blur', async () => {
      render(<Editor noteId="note-1" />);
      const titleInput = screen.getByDisplayValue('Test Note Title');

      await userEvent.type(titleInput, ' - updated');
      fireEvent.blur(titleInput);

      expect(mockUpdateNote).toHaveBeenCalledTimes(1);
      expect(mockUpdateNote).toHaveBeenCalledWith(
        'note-1',
        'Test Note Title - updated',
        'Test note content.'
      );
    });

    it('should call updateNote on editor blur', async () => {
      render(<Editor noteId="note-1" />);
      const contentEditor = screen.getByTestId('markdown-editor');

      await userEvent.type(contentEditor, ' And more content.');
      fireEvent.blur(contentEditor);

      expect(mockUpdateNote).toHaveBeenCalledTimes(1);
      expect(mockUpdateNote).toHaveBeenCalledWith(
        'note-1',
        'Test Note Title',
        'Test note content. And more content.'
      );
    });

    it('should call updateNote when save button is clicked', async () => {
      render(<Editor noteId="note-1" />);
      const saveButton = screen.getByRole('button', { name: /保存/i });

      await userEvent.click(saveButton);

      expect(mockUpdateNote).toHaveBeenCalledTimes(1);
      expect(mockUpdateNote).toHaveBeenCalledWith(
        'note-1',
        'Test Note Title',
        'Test note content.'
      );
    });
  });

  describe('New Note', () => {
    it('should open FolderSelectorDialog when saving a new note', async () => {
      render(<Editor noteId={undefined} />);

      const saveButton = screen.getByRole('button', { name: /保存/i });
      await userEvent.click(saveButton);

      expect(screen.getByTestId('folder-selector-dialog')).toBeInTheDocument();
    });

    it('should call createNote and router.push when a folder is selected', async () => {
      mockCreateNote.mockResolvedValue({ note: { id: 'new-note-id' } });
      render(<Editor noteId={undefined} />);

      // Find the title input by filtering all textboxes by tagName
      const inputs = screen.getAllByRole('textbox');
      const titleInput = inputs.find((input) => input.tagName === 'INPUT');
      const contentEditor = screen.getByTestId('markdown-editor');

      // Ensure the title input was found before proceeding
      expect(titleInput).toBeInTheDocument();
      if (!titleInput) return;

      // Set title and content
      await userEvent.type(titleInput, 'New Title');
      await userEvent.type(contentEditor, 'New Content');

      // Click save to open dialog
      const saveButton = screen.getByRole('button', { name: /保存/i });
      await userEvent.click(saveButton);

      // Simulate selecting a folder in the dialog
      const selectFolderButton = screen.getByRole('button', { name: /Select Folder/i });
      await userEvent.click(selectFolderButton);

      // Check if createNote was called
      expect(mockCreateNote).toHaveBeenCalledTimes(1);
      expect(mockCreateNote).toHaveBeenCalledWith('New Title', 'New Content', 'selected-folder-id');

      // Check if router.push was called
      expect(mockRouterPush).toHaveBeenCalledTimes(1);
      expect(mockRouterPush).toHaveBeenCalledWith('/note/new-note-id');
    });
  });
});
