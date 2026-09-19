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

  it('loads 5th semester and renders core and elective subjects correctly', () => {
    localStorage.setItem(
      'pyq_syllabus_prefs',
      JSON.stringify({ semester: 5, subjectId: null })
    );

    render(
      <BrowserRouter>
        <SyllabusTracker />
      </BrowserRouter>
    );

    expect(screen.getByText(/Software Engineering and Modelling/i)).toBeInTheDocument();
    expect(screen.getByText(/Finite Automata and Formal Languages/i)).toBeInTheDocument();
    expect(screen.getByText(/^Data Communication and Networking$/i)).toBeInTheDocument();
  });

  it('loads 6th semester and renders core and lab subjects correctly', () => {
    localStorage.setItem(
      'pyq_syllabus_prefs',
      JSON.stringify({ semester: 6, subjectId: null })
    );

    render(
      <BrowserRouter>
        <SyllabusTracker />
      </BrowserRouter>
    );

    expect(screen.getByText(/Management & Entrepreneurship/i)).toBeInTheDocument();
    expect(screen.getByText(/Cloud Computing and Microservices/i)).toBeInTheDocument();
    expect(screen.getByText(/Microservices and DevOps Lab/i)).toBeInTheDocument();
  });
});
