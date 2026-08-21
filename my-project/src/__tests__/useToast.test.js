import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import useToast from '../hooks/useToast.js';

describe('useToast hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with empty toasts list', () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toEqual([]);
  });

  it('adds success, error, and info toasts', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.success('Uploaded successfully!', 5000);
      result.current.error('Upload failed!');
    });

    expect(result.current.toasts.length).toBe(2);
    expect(result.current.toasts[0].message).toBe('Uploaded successfully!');
    expect(result.current.toasts[0].type).toBe('success');
    expect(result.current.toasts[1].message).toBe('Upload failed!');
    expect(result.current.toasts[1].type).toBe('error');
  });

  it('auto-dismisses toasts after specified duration', () => {
    const { result } = renderHook(() => useToast());

    act(() => {
      result.current.info('Notification', 2000);
    });

    expect(result.current.toasts.length).toBe(1);

    act(() => {
      vi.advanceTimersByTime(2100);
    });

    expect(result.current.toasts.length).toBe(0);
  });

  it('allows manual removal and clearing all toasts', () => {
    const { result } = renderHook(() => useToast());

    let id1;
    act(() => {
      id1 = result.current.addToast({ message: 'T1', duration: 0 });
      result.current.addToast({ message: 'T2', duration: 0 });
    });

    expect(result.current.toasts.length).toBe(2);

    act(() => {
      result.current.removeToast(id1);
    });

    expect(result.current.toasts.length).toBe(1);
    expect(result.current.toasts[0].message).toBe('T2');

    act(() => {
      result.current.clearToasts();
    });

    expect(result.current.toasts.length).toBe(0);
  });
});
