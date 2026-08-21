import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import useLocalStorage from '../hooks/useLocalStorage.js';

describe('useLocalStorage hook', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns initialValue when key is not in localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('testKey', 'default-val'));
    expect(result.current[0]).toBe('default-val');
  });

  it('reads existing value from localStorage on initialization', () => {
    localStorage.setItem('existingKey', JSON.stringify('stored-val'));
    const { result } = renderHook(() => useLocalStorage('existingKey', 'default-val'));
    expect(result.current[0]).toBe('stored-val');
  });

  it('updates state and localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage('itemKey', { count: 0 }));

    act(() => {
      result.current[1]({ count: 5 });
    });

    expect(result.current[0]).toEqual({ count: 5 });
    expect(JSON.parse(localStorage.getItem('itemKey'))).toEqual({ count: 5 });
  });

  it('supports functional state updates', () => {
    const { result } = renderHook(() => useLocalStorage('counter', 10));

    act(() => {
      result.current[1]((prev) => prev + 5);
    });

    expect(result.current[0]).toBe(15);
  });

  it('removes item from localStorage when removeValue is called', () => {
    localStorage.setItem('toBeRemoved', JSON.stringify('active'));
    const { result } = renderHook(() => useLocalStorage('toBeRemoved', 'fallback'));

    expect(result.current[0]).toBe('active');

    act(() => {
      result.current[2]();
    });

    expect(result.current[0]).toBe('fallback');
    expect(localStorage.getItem('toBeRemoved')).toBeNull();
  });
});
