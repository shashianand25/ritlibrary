import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useManageAdminsState from '../hooks/useManageAdminsState.js';

vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: {
      email: 'admin@rit.edu',
      displayName: 'Admin User',
      getIdToken: vi.fn().mockResolvedValue('fake-token'),
    },
    isAdmin: true,
    isAuthLoading: false,
  }),
}));

vi.mock('../api/client.js', () => ({
  getAdmins: vi.fn().mockResolvedValue({
    dbAdmins: [{ email: 'moderator@rit.edu' }],
    bootstrapAdmins: ['admin@rit.edu'],
  }),
  addAdmin: vi.fn().mockResolvedValue({ success: true }),
  removeAdmin: vi.fn().mockResolvedValue({ success: true }),
}));

describe('useManageAdminsState hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches admin lists on mount', async () => {
    const { result } = renderHook(() => useManageAdminsState());

    await act(async () => {
      await result.current.fetchAdmins();
    });

    expect(result.current.bootstrapAdmins).toContain('admin@rit.edu');
    expect(result.current.admins.length).toBe(1);
    expect(result.current.admins[0].email).toBe('moderator@rit.edu');
  });

  it('validates email before adding admin', async () => {
    const { result } = renderHook(() => useManageAdminsState());

    act(() => {
      result.current.setNewEmail('invalid-email');
    });

    await act(async () => {
      await result.current.handleAdd();
    });

    expect(result.current.error).toBe('Please enter a valid email address.');
  });

  it('successfully adds new admin when email is valid', async () => {
    const { result } = renderHook(() => useManageAdminsState());

    act(() => {
      result.current.setNewEmail('newmoderator@rit.edu');
    });

    await act(async () => {
      await result.current.handleAdd();
    });

    expect(result.current.error).toBe('');
    expect(result.current.newEmail).toBe('');
  });

  it('removes admin through API call', async () => {
    const { result } = renderHook(() => useManageAdminsState());

    await act(async () => {
      await result.current.handleRemove('oldadmin@rit.edu');
    });

    expect(result.current.actionLoading).toBe(false);
  });
});
