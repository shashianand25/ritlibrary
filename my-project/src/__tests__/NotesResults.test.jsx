import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NotesResults from '../components/search/NotesResults.jsx';
import { COLORS } from '../constants/searchData.js';

describe('NotesResults component', () => {
  it('renders empty state when no notes exist', () => {
    render(<NotesResults groupedNotes={[]} colors={COLORS} />);
    expect(screen.getByText('No Notes found for this subject')).toBeInTheDocument();
  });

  it('renders folders and files when notes are provided', () => {
    const mockGroupedNotes = [
      [
        'Unit 1',
        [
          {
            id: 'n1',
            name: 'Unit1_Summary.pdf',
            view: 'Unit 1 Summary',
            mimeType: 'application/pdf',
            section: 'A',
            uploaderName: 'Dr. Smith',
          },
        ],
      ],
    ];

    render(
      <NotesResults
        groupedNotes={mockGroupedNotes}
        openMenuId={null}
        setOpenMenuId={vi.fn()}
        openPreview={vi.fn()}
        isSmallScreen={false}
        colors={COLORS}
      />
    );

    expect(screen.getByText('Unit 1')).toBeInTheDocument();
    expect(screen.getByText('Unit 1 Summary')).toBeInTheDocument();
  });
});
