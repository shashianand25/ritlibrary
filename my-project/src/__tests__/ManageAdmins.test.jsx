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

vi.mock('../api/client.js', () => ({
  getAdmins: vi.fn().mockResolvedValue({
    dbAdmins: [{ email: 'moderator@rit.edu', created_at: new Date().toISOString() }],
    bootstrapAdmins: ['admin@rit.edu'],
  }),
  addAdmin: vi.fn().mockResolvedValue({ success: true }),
  removeAdmin: vi.fn().mockResolvedValue({ success: true }),
}));

describe('ManageAdmins component', () => {
  it('renders admin management interface with mocked API client', async () => {
    render(
      <BrowserRouter>
        <ManageAdmins />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Manage Admins/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Add New Admin/i)).toBeInTheDocument();
    expect(screen.getByText('moderator@rit.edu')).toBeInTheDocument();
  });
});
