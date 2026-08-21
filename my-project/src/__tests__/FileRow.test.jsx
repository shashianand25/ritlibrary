import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileRow, { MenuRow } from '../components/FileRow.jsx';
import { COLORS } from '../constants/searchData.js';

describe('FileRow and MenuRow components', () => {
  const mockFile = {
    id: 'file_123',
    name: '21CS32_Unit1_Notes.pdf',
    view: 'Unit 1 Notes',
    mimeType: 'application/pdf',
    section: 'A',
    uploaderName: 'Professor X',
  };

  it('renders file row information and triggers preview on click', () => {
    const openPreview = vi.fn();
    const setOpenMenuId = vi.fn();

    render(
      <FileRow
        file={mockFile}
        index={0}
        openMenuId={null}
        setOpenMenuId={setOpenMenuId}
        openPreview={openPreview}
        isSmallScreen={false}
        colors={COLORS}
      />
    );

    expect(screen.getByText('Unit 1 Notes')).toBeInTheDocument();
    expect(screen.getByText(/A · by Professor X/i)).toBeInTheDocument();

    const row = screen.getByText('Unit 1 Notes');
    fireEvent.click(row);
    expect(openPreview).toHaveBeenCalledWith(mockFile, 'drive');
  });

  it('renders MenuRow and handles click', () => {
    const onClick = vi.fn();
    render(<MenuRow label="Download File" onClick={onClick} colors={COLORS} />);

    const button = screen.getByText('Download File');
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });
});
