import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useSearchPyqState from '../hooks/useSearchPyqState.js';

vi.mock('../api/client.js', () => ({
  fetchFileIndex: vi.fn().mockResolvedValue({
    files: [{ id: '1', name: '21CS32_Unit1.pdf', category: 'notes', subjectCode: '21CS32' }],
  }),
}));

describe('useSearchPyqState hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with default state or localStorage values', async () => {
    localStorage.setItem('searchMode', 'code');
    localStorage.setItem('lastSubjectCode', '21CS32');

    const { result } = renderHook(() => useSearchPyqState());

    await waitFor(() => {
      expect(result.current.allData.length).toBe(1);
    });

    expect(result.current.searchMode).toBe('code');
    expect(result.current.subjectCode).toBe('21CS32');
  });

  it('updates form semester and computes year correctly', async () => {
    const { result } = renderHook(() => useSearchPyqState());

    await waitFor(() => {
      expect(result.current.allData.length).toBe(1);
    });

    act(() => {
      result.current.handleSemester({ target: { value: '3' } });
    });

    expect(result.current.form.semester).toBe('3');
    expect(result.current.form.year).toBe('2nd Year');
  });

  it('persists changes to localStorage', async () => {
    const { result } = renderHook(() => useSearchPyqState());

    await waitFor(() => {
      expect(result.current.allData.length).toBe(1);
    });

    act(() => {
      result.current.setSubjectCode('21MAT31');
    });

    expect(localStorage.getItem('lastSubjectCode')).toBe('21MAT31');
  });
});
