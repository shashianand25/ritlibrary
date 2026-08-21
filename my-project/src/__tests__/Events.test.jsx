import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Events from '../Events.jsx';
import * as apiClient from '../api/client.js';

let mockAuth = {
  user: {
    email: 'student@msrit.edu',
    displayName: 'Student RIT',
    getIdToken: vi.fn().mockResolvedValue('token'),
  },
  isAdmin: true,
};

vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('../Header.jsx', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../api/client.js', () => ({
  fetchEvents: vi.fn().mockResolvedValue({
    events: [
      {
        id: 'ev-1',
        title: 'Hackathon 2026',
        description: 'Annual RIT coding marathon',
        category: 'hackathon',
        date: '2026-09-15',
        venue: 'ESB Seminar Hall',
      },
      {
        id: 'ev-2',
        title: 'Tech Talk',
        description: 'AI advancements in 2026',
        category: 'event',
        date: '2026-10-01',
        venue: 'Apex Block',
      },
    ],
  }),
  deleteEvent: vi.fn().mockResolvedValue({ success: true }),
}));

describe('Events component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.fetchEvents.mockResolvedValue({
      events: [
        {
          id: 'ev-1',
          title: 'Hackathon 2026',
          description: 'Annual RIT coding marathon',
          category: 'hackathon',
          date: '2026-09-15',
          venue: 'ESB Seminar Hall',
        },
        {
          id: 'ev-2',
          title: 'Tech Talk',
          description: 'AI advancements in 2026',
          category: 'event',
          date: '2026-10-01',
          venue: 'Apex Block',
        },
      ],
    });
    apiClient.deleteEvent.mockResolvedValue({ success: true });
    mockAuth = {
      user: {
        email: 'student@msrit.edu',
        displayName: 'Student RIT',
        getIdToken: vi.fn().mockResolvedValue('token'),
      },
      isAdmin: true,
    };
  });

  it('renders events page and loads event cards', async () => {
    render(<Events />);

    expect(screen.getByText(/Events, Hackathons & Challenges/i)).toBeInTheDocument();
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Hackathon 2026')).toBeInTheDocument();
      expect(screen.getByText('Tech Talk')).toBeInTheDocument();
    });
  });

  it('filters events by category and displays empty state when none match', async () => {
    render(<Events />);

    await waitFor(() => {
      expect(screen.getByText('Hackathon 2026')).toBeInTheDocument();
    });

    // Filter by Hackathons
    fireEvent.click(screen.getByRole('button', { name: /Hackathons/i }));
    await waitFor(() => {
      expect(screen.getByText('Hackathon 2026')).toBeInTheDocument();
      expect(screen.queryByText('Tech Talk')).not.toBeInTheDocument();
    });

    // Filter by Challenges (empty)
    fireEvent.click(screen.getByRole('button', { name: /Challenges/i }));
    await waitFor(() => {
      expect(screen.getByText('No entries found')).toBeInTheDocument();
    });

    // Reset to All
    fireEvent.click(screen.getByRole('button', { name: /^All$/i }));
    await waitFor(() => {
      expect(screen.getByText('Hackathon 2026')).toBeInTheDocument();
      expect(screen.getByText('Tech Talk')).toBeInTheDocument();
    });
  });

  it('handles event deletion with confirm and error handling', async () => {
    const confirmSpy = vi.spyOn(window, 'confirm');
    const deleteSpy = vi.spyOn(apiClient, 'deleteEvent');

    render(<Events />);

    await waitFor(() => {
      expect(screen.getByText('Hackathon 2026')).toBeInTheDocument();
    });

    const deleteBtns = screen.getAllByRole('button', { name: /^Delete$/i });

    // Cancel deletion
    confirmSpy.mockReturnValueOnce(false);
    fireEvent.click(deleteBtns[0]);
    expect(deleteSpy).not.toHaveBeenCalled();

    // Confirm deletion
    confirmSpy.mockReturnValueOnce(true);
    fireEvent.click(deleteBtns[0]);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('ev-1', 'token');
      expect(screen.queryByText('Hackathon 2026')).not.toBeInTheDocument();
    });
  });
});
