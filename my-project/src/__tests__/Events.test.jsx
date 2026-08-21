import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Events from '../Events.jsx';

vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: { email: 'student@msrit.edu', displayName: 'Student RIT' },
    isAdmin: true,
  }),
}));

vi.mock('../Header.jsx', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

describe('Events component', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          events: [
            {
              id: 'ev-1',
              title: 'Hackathon 2026',
              description: 'Annual RIT coding marathon',
              category: 'hackathon',
              date: '2026-09-15',
              venue: 'ESB Seminar Hall',
            },
          ],
        }),
      })
    );
  });

  it('renders events page and loads event cards', async () => {
    render(<Events />);

    expect(screen.getByText(/Events, Hackathons & Challenges/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Hackathon 2026')).toBeInTheDocument();
      expect(screen.getByText('Annual RIT coding marathon')).toBeInTheDocument();
    });
  });
});
