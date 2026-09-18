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

const mockFiles = [
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
];

describe('SearchPYQ component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ files: mockFiles, lastUpdated: '2026-09-18T00:00:00Z' }),
      })
    );
  });

  it('renders search pyq page layout, mode toggles, and welcome banner', () => {
    render(<SearchPYQ />);
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText('Guided')).toBeInTheDocument();
    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('RIT Library Resources')).toBeInTheDocument();
  });

  it('switches to subject code search and validates short input', async () => {
    render(<SearchPYQ />);

    fireEvent.click(screen.getByText('Code'));
    const input = await screen.findByPlaceholderText(/e\.g\.\s+MAE11/i);
    expect(input).toBeInTheDocument();

    const searchBtn = screen.getByRole('button', { name: /Search Resources/i });
    fireEvent.click(searchBtn);
    expect(
      await screen.findByText('Subject code must be at least 4 characters')
    ).toBeInTheDocument();
  });

  it('searches by subject code, renders results, switches tabs, and previews file', async () => {
    render(<SearchPYQ />);

    await waitFor(() => {
      expect(screen.getByText('Code')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Code'));
    const input = await screen.findByPlaceholderText(/e\.g\.\s+MAE11/i);
    fireEvent.change(input, { target: { value: '21CS32' } });

    const searchBtn = screen.getByRole('button', { name: /Search Resources/i });
    fireEvent.click(searchBtn);

    // Wait for search results tabs
    await waitFor(
      () => {
        expect(screen.getByText('Notes')).toBeInTheDocument();
        expect(screen.getByText('PYQs')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    // Default tab shows notes
    await waitFor(() => {
      expect(screen.getByText(/Data Structures Notes/i)).toBeInTheDocument();
    });

    // Switch to PYQs tab
    fireEvent.click(screen.getByText('PYQs'));
    await waitFor(() => {
      expect(screen.getByText('College-Wide PYQ Repository')).toBeInTheDocument();
      expect(screen.getByText(/SEE Question Paper/i)).toBeInTheDocument();
    });

    const collegeDriveLink = screen.getByRole('link', { name: /College-Wide PYQ Repository/i });
    expect(collegeDriveLink).toHaveAttribute(
      'href',
      'https://drive.google.com/drive/folders/1FDy6mEK5kV3Jost-dsjdoZUoTHowq2om'
    );
    expect(collegeDriveLink).toHaveAttribute('target', '_blank');

    // Click file row to open preview
    fireEvent.click(screen.getByText(/SEE Question Paper/i));

    await waitFor(() => {
      expect(screen.getByTestId('mock-drive-preview')).toBeInTheDocument();
    });
  });
});
