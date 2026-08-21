import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchPYQ from '../searchpyq.jsx';

vi.mock('../Header.jsx', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../pdf.jsx', () => ({
  default: ({ fileName }) => <div data-testid="mock-drive-preview">Drive Preview: {fileName}</div>,
}));

vi.mock('../mozillapdf.jsx', () => ({
  default: ({ fileName }) => (
    <div data-testid="mock-mozilla-preview">Mozilla Preview: {fileName}</div>
  ),
}));

vi.mock('../api/client.js', () => ({
  fetchFileIndex: vi.fn().mockResolvedValue({
    files: [
      {
        id: '1',
        name: 'Notes/2nd Year/3rd Sem/CS/21CS32/Unit 1/Notes.pdf',
        category: 'Notes',
        subjectCode: '21CS32',
        folderName: 'Unit 1',
        view: 'Data Structures Notes',
      },
      {
        id: '2',
        name: 'PYQ/2nd Year/3rd Sem/CS/21CS32/2023-24/SEE.pdf',
        category: 'PYQ',
        subjectCode: '21CS32',
        folderName: '2023-24',
        view: 'SEE Question Paper',
      },
    ],
  }),
}));

describe('SearchPYQ component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders search pyq page layout and filters', () => {
    render(<SearchPYQ />);
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText('Guided Search')).toBeInTheDocument();
    expect(screen.getByText('Subject Code Search')).toBeInTheDocument();
    expect(screen.getByText('Find Course Materials')).toBeInTheDocument();
  });

  it('switches to subject code search and validates empty input', () => {
    render(<SearchPYQ />);

    fireEvent.click(screen.getByText('Subject Code Search'));
    expect(screen.getByPlaceholderText(/Enter Subject Code/i)).toBeInTheDocument();

    const searchBtn = screen.getByRole('button', { name: /Search Resources/i });
    fireEvent.click(searchBtn);
    expect(screen.getByText('Please enter a subject code')).toBeInTheDocument();
  });

  it('searches by subject code, renders results, switches tabs, and previews file', async () => {
    render(<SearchPYQ />);

    // Wait for initial file index fetch
    await waitFor(() => {
      expect(screen.getByText('Subject Code Search')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Subject Code Search'));
    const input = screen.getByPlaceholderText(/Enter Subject Code/i);
    fireEvent.change(input, { target: { value: '21CS32' } });

    const searchBtn = screen.getByRole('button', { name: /Search Resources/i });
    fireEvent.click(searchBtn);

    // Wait for search results
    await waitFor(
      () => {
        expect(screen.getByText('Study Notes')).toBeInTheDocument();
        expect(screen.getByText('Question Papers')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Default tab is study notes
    await waitFor(() => {
      expect(screen.getByText('Data Structures Notes')).toBeInTheDocument();
    });

    // Switch to question papers tab
    fireEvent.click(screen.getByText('Question Papers'));
    await waitFor(() => {
      expect(screen.getByText('SEE Question Paper')).toBeInTheDocument();
    });

    // Click file row to open preview
    fireEvent.click(screen.getByText('SEE Question Paper'));

    await waitFor(() => {
      expect(screen.getByTestId('mock-drive-preview')).toBeInTheDocument();
    });

    // Close preview modal
    const closeBtn = screen.getByRole('button', { name: /Close/i });
    fireEvent.click(closeBtn);

    await waitFor(() => {
      expect(screen.queryByTestId('mock-drive-preview')).not.toBeInTheDocument();
    });
  });
});
