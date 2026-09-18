import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import PyqResults from '../components/search/PyqResults.jsx';
import { COLORS } from '../constants/searchData.js';

describe('PyqResults component', () => {
  it('renders college-wide pyq drive link button and empty state when no pyq files exist', () => {
    render(<PyqResults pdfFiles={[]} groupedPDFs={[]} colors={COLORS} />);
    expect(screen.getByText('College-Wide PYQ Repository')).toBeInTheDocument();
    expect(screen.getByText('Open Drive')).toBeInTheDocument();
    const driveLink = screen.getByRole('link', { name: /College-Wide PYQ Repository/i });
    expect(driveLink).toHaveAttribute(
      'href',
      'https://drive.google.com/drive/folders/1FDy6mEK5kV3Jost-dsjdoZUoTHowq2om'
    );
    expect(driveLink).toHaveAttribute('target', '_blank');
    expect(screen.getByText('No PYQs found for this subject')).toBeInTheDocument();
  });

  it('renders question paper folders and files along with college-wide drive link when provided', () => {
    const mockFiles = [
      {
        id: 'p1',
        name: '2023_SEE_QuestionPaper.pdf',
        view: '2023 SEE Paper',
        mimeType: 'application/pdf',
        section: 'Gen',
        uploaderName: 'Exam Cell',
      },
    ];
    const mockGrouped = [['2023-24', mockFiles]];

    render(
      <PyqResults
        pdfFiles={mockFiles}
        groupedPDFs={mockGrouped}
        openMenuId={null}
        setOpenMenuId={vi.fn()}
        openPreview={vi.fn()}
        isSmallScreen={false}
        colors={COLORS}
      />
    );

    expect(screen.getByText('College-Wide PYQ Repository')).toBeInTheDocument();
    expect(screen.getByText('2023-24')).toBeInTheDocument();
    expect(screen.getByText('2023 SEE Paper')).toBeInTheDocument();
  });
});
