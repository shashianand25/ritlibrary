import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import About from '../About.jsx';

// Mock AuthContext
vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: null,
    isAdmin: false,
    isAuthLoading: false,
  }),
}));

describe('About component', () => {
  it('renders project mission and features', () => {
    render(
      <BrowserRouter>
        <About />
      </BrowserRouter>
    );

    expect(screen.getByText(/About RIT Library/i)).toBeInTheDocument();
  });
});
