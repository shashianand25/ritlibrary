import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AdminEventForm from '../components/events/AdminEventForm.jsx';

vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: {
      email: 'admin@rit.edu',
      displayName: 'Admin User',
      getIdToken: vi.fn().mockResolvedValue('token'),
    },
  }),
}));

vi.mock('../api/client.js', () => ({
  createEvent: vi.fn().mockResolvedValue({ event: { id: 'e-1', title: 'New Hackathon' } }),
}));

describe('AdminEventForm component', () => {
  it('renders expand button and opens form on click', () => {
    render(<AdminEventForm onCreated={vi.fn()} />);

    expect(screen.getByText(/Event upload/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Event upload/i));
    expect(screen.getByPlaceholderText(/Title/i)).toBeInTheDocument();
  });
});
