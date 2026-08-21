import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Contribute from '../Contribute.jsx';

vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: { email: 'contributor@msrit.edu', displayName: 'Contributor' },
    isAdmin: false,
  }),
}));

vi.mock('../Header.jsx', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

describe('Contribute component', () => {
  it('renders contribution header and options', () => {
    render(<Contribute />);

    expect(
      screen.getByText(/Select your Semester, Branch, and Subject above to begin contributing/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Course Notes')).toBeInTheDocument();
    expect(screen.getByText('Question Papers')).toBeInTheDocument();
  });
});
