import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Contribute from '../Contribute.jsx';

vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: {
      email: 'contributor@msrit.edu',
      displayName: 'Contributor',
      getIdToken: vi.fn().mockResolvedValue('token'),
    },
    isAdmin: true,
  }),
}));

vi.mock('../Header.jsx', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../api/client.js', () => ({
  fetchFileIndex: vi.fn().mockResolvedValue([
    {
      id: 'f-1',
      name: 'Notes/3/CSE/21CS32/Unit 1/Notes.pdf',
      category: 'Notes',
      subjectCode: '21CS32',
      folderName: 'Unit 1',
    },
  ]),
  deleteResource: vi.fn().mockResolvedValue({ success: true }),
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

  it('switches between notes and question papers', () => {
    render(<Contribute />);

    const pyqBtn = screen.getByRole('button', { name: /Question Papers/i });
    fireEvent.click(pyqBtn);
    expect(pyqBtn).toBeInTheDocument();

    const notesBtn = screen.getByRole('button', { name: /Course Notes/i });
    fireEvent.click(notesBtn);
    expect(notesBtn).toBeInTheDocument();
  });
});
