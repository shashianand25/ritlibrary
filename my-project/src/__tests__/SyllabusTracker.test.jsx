import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import SyllabusTracker from '../SyllabusTracker.jsx';

// Mock AuthContext
vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: null,
    isAdmin: false,
    isAuthLoading: false,
  }),
}));

describe('SyllabusTracker component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it('renders tracker without throwing error on fresh mount', () => {
    render(
      <BrowserRouter>
        <SyllabusTracker />
      </BrowserRouter>
    );

    expect(screen.getByText(/Syllabus Tracker/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Track your preparation progress across all subjects/i)
    ).toBeInTheDocument();
  });

  it('handles corrupted localStorage JSON gracefully without crashing', () => {
    localStorage.setItem('pyq_syllabus_prefs', 'INVALID_CORRUPTED_JSON{{{');
    localStorage.setItem('pyq_syllabus_tracker', 'MALFORMED_JSON:::');

    render(
      <BrowserRouter>
        <SyllabusTracker />
      </BrowserRouter>
    );

    // Verify it recovered cleanly to default state
    expect(screen.getByText(/Syllabus Tracker/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Track your preparation progress across all subjects/i)
    ).toBeInTheDocument();
  });
});
