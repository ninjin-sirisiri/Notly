import { renderHook, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useFolders } from '@/hooks/useFolders';
import type { FolderTree } from '@/types/api';

// Mock the global window.api object
const mockApi = {
  folder: {
    list: vi.fn(),
    create: vi.fn(),
    delete: vi.fn(),
    updateFolderName: vi.fn(),
  },
};
// vi.stubGlobal('api', mockApi); // stubGlobal is not working as expected, using setupFiles instead

const mockFolders: FolderTree[] = [
  {
    id: '1',
    name: 'Folder 1',
    folderPath: '/1',
    children: [],
    createdAt: new Date(),
    parentId: null,
  },
  {
    id: '2',
    name: 'Folder 2',
    folderPath: '/2',
    children: [],
    createdAt: new Date(),
    parentId: null,
  },
];

describe('useFolders Hook', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks();
    vi.stubGlobal('api', mockApi);
  });

  it('should load folders on initial render', async () => {
    mockApi.folder.list.mockResolvedValue({ folders: mockFolders });

    const { result, rerender } = renderHook(() => useFolders());

    expect(result.current.loading).toBe(true);

    await act(async () => {
      rerender();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.folders).toEqual(mockFolders);
    expect(mockApi.folder.list).toHaveBeenCalledTimes(1);
  });

  it('should handle error when loading folders', async () => {
    const testError = new Error('Failed to load folders');
    mockApi.folder.list.mockRejectedValue(testError);

    const { result, rerender } = renderHook(() => useFolders());

    await act(async () => {
      rerender();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toEqual(testError);
    expect(result.current.folders).toEqual([]);
  });

  it('should create a new folder and refresh the list', async () => {
    const newFolder: FolderTree = {
      id: '3',
      name: 'New Folder',
      folderPath: '/3',
      children: [],
      createdAt: new Date(),
      parentId: null,
    };

    mockApi.folder.list.mockResolvedValueOnce({ folders: mockFolders }); // Initial load
    mockApi.folder.create.mockResolvedValue({ folder: newFolder });
    mockApi.folder.list.mockResolvedValueOnce({ folders: [...mockFolders, newFolder] }); // After creation

    const { result, rerender } = renderHook(() => useFolders());

    await act(async () => {
      rerender();
    });

    await act(async () => {
      await result.current.createFolder('New Folder');
    });

    expect(mockApi.folder.create).toHaveBeenCalledWith({ name: 'New Folder', parentId: undefined });
    expect(mockApi.folder.list).toHaveBeenCalledTimes(2);
    expect(result.current.folders).toEqual([...mockFolders, newFolder]);
  });

  it('should delete a folder and refresh the list', async () => {
    mockApi.folder.list.mockResolvedValueOnce({ folders: mockFolders }); // Initial load
    mockApi.folder.delete.mockResolvedValue(undefined);
    mockApi.folder.list.mockResolvedValueOnce({ folders: [mockFolders[1]] }); // After deletion

    const { result, rerender } = renderHook(() => useFolders());

    await act(async () => {
      rerender();
    });

    await act(async () => {
      await result.current.deleteFolder('1');
    });

    expect(mockApi.folder.delete).toHaveBeenCalledWith('1');
    expect(mockApi.folder.list).toHaveBeenCalledTimes(2);
    expect(result.current.folders).toEqual([mockFolders[1]]);
  });

  it('should update a folder name and refresh the list', async () => {
    const updatedFolder = { ...mockFolders[0], name: 'Updated Name' };
    mockApi.folder.list.mockResolvedValueOnce({ folders: mockFolders }); // Initial load
    mockApi.folder.updateFolderName.mockResolvedValue(undefined);
    mockApi.folder.list.mockResolvedValueOnce({ folders: [updatedFolder, mockFolders[1]] }); // After update

    const { result, rerender } = renderHook(() => useFolders());

    await act(async () => {
      rerender();
    });

    await act(async () => {
      await result.current.updateFolderName('1', 'Updated Name');
    });

    expect(mockApi.folder.updateFolderName).toHaveBeenCalledWith({ id: '1', name: 'Updated Name' });
    expect(mockApi.folder.list).toHaveBeenCalledTimes(2);
    expect(result.current.folders[0].name).toBe('Updated Name');
  });
});
