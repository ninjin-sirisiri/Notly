import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NotesProvider } from '@/context/notes-context';
import { useNotes } from '@/hooks/useNotes';
import type { Note } from '@/types/database';
import { CreateNoteResponse, UpdateNoteResponse } from '@/types/api';

// Mock the global window.api object
const mockApi = {
  note: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};
vi.stubGlobal('api', mockApi);

const mockNotes: Note[] = [
  {
    id: '1',
    title: 'Test Note 1',
    content: 'Content 1',
    folderId: 'f1',
    createdAt: new Date(),
    updatedAt: new Date(),
    filePath: '',
  },
  {
    id: '2',
    title: 'Test Note 2',
    content: 'Content 2',
    folderId: 'f1',
    createdAt: new Date(),
    updatedAt: new Date(),
    filePath: '',
  },
];

// A wrapper component that provides the NotesContext
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <NotesProvider>{children}</NotesProvider>
);

describe('useNotes Hook', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
  });

  it('should load notes on initial render', async () => {
    mockApi.note.list.mockResolvedValue({ notes: mockNotes });

    const { result, rerender } = renderHook(() => useNotes(), { wrapper });

    // Initially, loading should be true
    expect(result.current.loading).toBe(true);

    // Wait for the notes to be loaded
    await act(async () => {
      rerender();
    });

    // After loading, the notes should be set and loading should be false
    expect(result.current.loading).toBe(false);
    expect(result.current.notes).toEqual(mockNotes);
    expect(mockApi.note.list).toHaveBeenCalledTimes(1);
  });

  it('should handle error when loading notes', async () => {
    const testError = new Error('Failed to load notes');
    mockApi.note.list.mockRejectedValue(testError);

    const { result, rerender } = renderHook(() => useNotes(), { wrapper });

    // Wait for the error to be handled
    await act(async () => {
      rerender();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(testError);
    expect(result.current.notes).toEqual([]);
  });

  it('should create a new note and refresh the list', async () => {
    const newNote: Note = {
      id: '3',
      title: 'New Note',
      content: 'New Content',
      folderId: 'f1',
      createdAt: new Date(),
      updatedAt: new Date(),
      filePath: '',
    };
    const createResponse: CreateNoteResponse = { note: newNote, filePath: '' };

    mockApi.note.list.mockResolvedValueOnce({ notes: mockNotes }); // Initial load
    mockApi.note.create.mockResolvedValue(createResponse);
    mockApi.note.list.mockResolvedValueOnce({ notes: [...mockNotes, newNote] }); // After creation

    const { result, rerender } = renderHook(() => useNotes(), { wrapper });

    // Wait for initial load
    await act(async () => {
      rerender();
    });

    await act(async () => {
      await result.current.createNote('New Note', 'New Content', 'f1');
    });

    expect(mockApi.note.create).toHaveBeenCalledWith({
      title: 'New Note',
      content: 'New Content',
      folderId: 'f1',
    });
    expect(mockApi.note.list).toHaveBeenCalledTimes(2);
    expect(result.current.notes).toEqual([...mockNotes, newNote]);
  });

  it('should update a note and refresh the list', async () => {
    const updatedNote: Note = { ...mockNotes[0], title: 'Updated Title' };
    const updateResponse: UpdateNoteResponse = { note: updatedNote };

    mockApi.note.list.mockResolvedValueOnce({ notes: mockNotes }); // Initial load
    mockApi.note.update.mockResolvedValue(updateResponse);
    mockApi.note.list.mockResolvedValueOnce({ notes: [updatedNote, mockNotes[1]] }); // After update

    const { result, rerender } = renderHook(() => useNotes(), { wrapper });

    await act(async () => {
      rerender();
    });

    await act(async () => {
      await result.current.updateNote('1', 'Updated Title');
    });

    expect(mockApi.note.update).toHaveBeenCalledWith({ id: '1', title: 'Updated Title' });
    expect(mockApi.note.list).toHaveBeenCalledTimes(2);
    expect(result.current.notes[0].title).toBe('Updated Title');
  });

  it('should delete a note and refresh the list', async () => {
    mockApi.note.list.mockResolvedValueOnce({ notes: mockNotes }); // Initial load
    mockApi.note.delete.mockResolvedValue(undefined);
    mockApi.note.list.mockResolvedValueOnce({ notes: [mockNotes[1]] }); // After deletion

    const { result, rerender } = renderHook(() => useNotes(), { wrapper });

    await act(async () => {
      rerender();
    });

    await act(async () => {
      await result.current.deleteNote('1');
    });

    expect(mockApi.note.delete).toHaveBeenCalledWith({ id: '1' });
    expect(mockApi.note.list).toHaveBeenCalledTimes(2);
    expect(result.current.notes).toEqual([mockNotes[1]]);
  });
});
