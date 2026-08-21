import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useDebounce, useDebouncedCallback } from '../hooks/useDebounce.js';

describe('useDebounce and useDebouncedCallback hooks', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays updating value until specified timeout passes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 300 } }
    );

    expect(result.current).toBe('initial');

    rerender({ value: 'updated', delay: 300 });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('initial');

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe('updated');
  });

  it('cancels pending timer on fast successive changes', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 300),
      { initialProps: { value: 'first' } }
    );

    rerender({ value: 'second' });
    act(() => {
      vi.advanceTimersByTime(100);
    });

    rerender({ value: 'third' });
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(result.current).toBe('first');

    act(() => {
      vi.advanceTimersByTime(150);
    });
    expect(result.current).toBe('third');
  });

  it('debounces function invocations with useDebouncedCallback', () => {
    const spy = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(spy, 250));

    act(() => {
      result.current('call1');
      result.current('call2');
      result.current('call3');
    });

    expect(spy).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('call3');
  });
});
