import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import ManageAdmins from '../ManageAdmins.jsx';

// Mock AuthContext as Admin
vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: {
      email: 'admin@rit.edu',
      displayName: 'Admin User',
      getIdToken: vi.fn().mockResolvedValue('fake-token'),
    },
    isAdmin: true,
    isAuthLoading: false,
    signOut: vi.fn(),
  }),
}));

describe('ManageAdmins component', () => {
  it('renders admin management interface for authenticated admins', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ dbAdmins: [], bootstrapAdmins: ['admin@rit.edu'] }),
    });

    render(
      <BrowserRouter>
        <ManageAdmins />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Manage Admins/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Add New Admin/i)).toBeInTheDocument();
  });
});
