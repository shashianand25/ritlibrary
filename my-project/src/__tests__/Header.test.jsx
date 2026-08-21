import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import Header from '../Header.jsx';

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

describe('Header component', () => {
  it('renders navigation links properly', () => {
    render(
      <BrowserRouter>
        <Header />
      </BrowserRouter>
    );

    expect(screen.getByText(/RIT Library/i)).toBeInTheDocument();
    expect(screen.getByText(/About/i)).toBeInTheDocument();
    expect(screen.getByText(/Notes/i)).toBeInTheDocument();
    expect(screen.getByText(/Syllabus/i)).toBeInTheDocument();
    expect(screen.getByText(/Contribute/i)).toBeInTheDocument();
  });
});
