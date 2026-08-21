import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useContributeState from '../hooks/useContributeState.js';

vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: {
      email: 'contributor@rit.edu',
      displayName: 'Contributor',
      getIdToken: vi.fn().mockResolvedValue('token-abc'),
    },
    isAdmin: true,
    isAuthLoading: false,
  }),
}));

vi.mock('../api/client.js', () => ({
  fetchFileIndex: vi.fn().mockResolvedValue([
    {
      id: 'f1',
      name: 'Notes/3/CSE/21CS32/Unit 1/Notes.pdf',
      category: 'Notes',
      subjectCode: '21CS32',
      folderName: 'Unit 1',
    },
  ]),
  deleteResource: vi.fn().mockResolvedValue({ success: true }),
}));

describe('useContributeState hook', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('initializes default values from localStorage', async () => {
    localStorage.setItem('contributeMode', 'pyq');
    localStorage.setItem('contributeSem', '4');

    const { result } = renderHook(() => useContributeState());

    await waitFor(() => {
      expect(result.current.allFiles.length).toBe(1);
    });

    expect(result.current.mode).toBe('pyq');
    expect(result.current.semester).toBe('4');
  });

  it('updates semester and resets child fields', async () => {
    const { result } = renderHook(() => useContributeState());

    await waitFor(() => {
      expect(result.current.allFiles.length).toBe(1);
    });

    act(() => {
      result.current.handleSem({ target: { value: '3' } });
    });

    expect(result.current.semester).toBe('3');
    expect(result.current.branch).toBe('');
    expect(result.current.subject).toBe('');
  });

  it('switches modes and persists to localStorage', async () => {
    const { result } = renderHook(() => useContributeState());

    await waitFor(() => {
      expect(result.current.allFiles.length).toBe(1);
    });

    act(() => {
      result.current.handleMode('pyq');
    });

    expect(result.current.mode).toBe('pyq');
    expect(localStorage.getItem('contributeMode')).toBe('pyq');
  });

  it('adds custom folder and performs file deletion', async () => {
    const { result } = renderHook(() => useContributeState());

    await waitFor(() => {
      expect(result.current.allFiles.length).toBe(1);
    });

    act(() => {
      result.current.setNewFolder('Assignment Solutions');
    });

    act(() => {
      result.current.addFolder(['Unit 1', 'Unit 2']);
    });

    expect(result.current.customFolders).toContain('Assignment Solutions');
    expect(result.current.newFolder).toBe('');

    await act(async () => {
      await result.current.deleteFile({ id: 'f1', name: 'Notes.pdf' });
    });

    expect(result.current.deleteError).toBe('');
  });
});
