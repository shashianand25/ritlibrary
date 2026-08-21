import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useContributeState from '../hooks/useContributeState.js';

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
}));

describe('useContributeState hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes default values from localStorage', () => {
    localStorage.setItem('contributeMode', 'pyq');
    localStorage.setItem('contributeSem', '4');

    const { result } = renderHook(() => useContributeState());

    expect(result.current.mode).toBe('pyq');
    expect(result.current.semester).toBe('4');
  });

  it('updates semester and resets child fields', () => {
    const { result } = renderHook(() => useContributeState());

    act(() => {
      result.current.handleSem({ target: { value: '3' } });
    });

    expect(result.current.semester).toBe('3');
    expect(result.current.branch).toBe('');
    expect(result.current.subject).toBe('');
  });

  it('switches modes and persists to localStorage', () => {
    const { result } = renderHook(() => useContributeState());

    act(() => {
      result.current.handleMode('pyq');
    });

    expect(result.current.mode).toBe('pyq');
    expect(localStorage.getItem('contributeMode')).toBe('pyq');
  });
});
