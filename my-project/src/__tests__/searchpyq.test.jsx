import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchPYQ from '../searchpyq.jsx';

vi.mock('../Header.jsx', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../api/client.js', () => ({
  fetchFileIndex: vi.fn().mockResolvedValue({
    files: [
      {
        id: '1',
        name: 'Notes/3/CSE/21CS32/Unit 1/Notes.pdf',
        category: 'Notes',
        subjectCode: '21CS32',
      },
      { id: '2', name: 'PYQ/3/CSE/21CS32/2023-24/SEE.pdf', category: 'PYQ', subjectCode: '21CS32' },
    ],
  }),
}));

describe('SearchPYQ component', () => {
  it('renders search pyq page layout and filters', () => {
    render(<SearchPYQ />);
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText('Guided Search')).toBeInTheDocument();
    expect(screen.getByText('Subject Code Search')).toBeInTheDocument();
  });

  it('switches to subject code search and validates empty input', () => {
    render(<SearchPYQ />);

    fireEvent.click(screen.getByText('Subject Code Search'));
    expect(screen.getByPlaceholderText(/Enter Subject Code/i)).toBeInTheDocument();

    const searchBtn = screen.getByRole('button', { name: /Search Resources/i });
    fireEvent.click(searchBtn);
    expect(screen.getByText('Please enter a subject code')).toBeInTheDocument();
  });
});
