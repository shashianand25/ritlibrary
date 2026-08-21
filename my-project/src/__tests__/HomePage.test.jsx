import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '../HomePage.jsx';

// Mock AuthContext
vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: null,
    isAdmin: false,
    isAuthLoading: false,
    signIn: vi.fn(),
    signOut: vi.fn(),
  }),
}));

describe('HomePage component', () => {
  it('renders hero titles and explore actions', () => {
    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Your Academic/i)).toBeInTheDocument();
    expect(screen.getByText(/Resource Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse Resources/i)).toBeInTheDocument();
  });
});
