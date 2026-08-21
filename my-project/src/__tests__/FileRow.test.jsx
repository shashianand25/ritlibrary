import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FileRow, { MenuRow } from '../components/FileRow.jsx';
import { COLORS } from '../constants/searchData.js';

describe('FileRow and MenuRow components', () => {
  const mockPdfFile = {
    id: 'file_123',
    name: '21CS32_Unit1_Notes.pdf',
    view: 'Unit 1 Notes',
    mimeType: 'application/pdf',
    section: 'A',
    uploaderName: 'Professor X',
  };

  const mockNonPdfFile = {
    id: 'file_456',
    name: 'LectureSlides.pptx',
    mimeType: 'application/vnd.ms-powerpoint',
    section: 'Gen',
  };

  it('renders file row information and triggers preview on click', () => {
    const openPreview = vi.fn();
    const setOpenMenuId = vi.fn();

    render(
      <FileRow
        file={mockPdfFile}
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
    expect(openPreview).toHaveBeenCalledWith(mockPdfFile, 'drive');
  });

  it('opens three dot menu and handles Open in Drive action', () => {
    const openPreview = vi.fn();
    const setOpenMenuId = vi.fn();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => {});

    const { rerender } = render(
      <FileRow
        file={mockPdfFile}
        index={0}
        openMenuId={null}
        setOpenMenuId={setOpenMenuId}
        openPreview={openPreview}
        isSmallScreen={true}
        colors={COLORS}
      />
    );

    const menuBtn = screen.getByRole('button');
    fireEvent.click(menuBtn);
    expect(setOpenMenuId).toHaveBeenCalledWith('file_123');

    // Rerender as open
    rerender(
      <FileRow
        file={mockPdfFile}
        index={0}
        openMenuId="file_123"
        setOpenMenuId={setOpenMenuId}
        openPreview={openPreview}
        isSmallScreen={true}
        colors={COLORS}
      />
    );

    const driveOption = screen.getByText('Open in Drive');
    expect(driveOption).toBeInTheDocument();
    fireEvent.click(driveOption);
    expect(openSpy).toHaveBeenCalledWith('https://drive.google.com/file/d/file_123/view', '_blank');

    const mozillaOption = screen.getByText('Mozilla Viewer');
    expect(mozillaOption).toBeInTheDocument();
    fireEvent.click(mozillaOption);
    expect(openPreview).toHaveBeenCalledWith(mockPdfFile, 'mozilla');
  });

  it('renders non-pdf file without Mozilla Viewer option', () => {
    const openPreview = vi.fn();
    const setOpenMenuId = vi.fn();

    render(
      <FileRow
        file={mockNonPdfFile}
        index={1}
        openMenuId="file_456"
        setOpenMenuId={setOpenMenuId}
        openPreview={openPreview}
        isSmallScreen={false}
        colors={COLORS}
      />
    );

    expect(screen.getByText('LectureSlides.pptx')).toBeInTheDocument();
    expect(screen.getByText('Open in Drive')).toBeInTheDocument();
    expect(screen.queryByText('Mozilla Viewer')).not.toBeInTheDocument();
  });

  it('renders MenuRow and handles hover and click', () => {
    const onClick = vi.fn();
    render(<MenuRow label="Download File" onClick={onClick} colors={COLORS} />);

    const button = screen.getByText('Download File');
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    fireEvent.click(button);
    expect(onClick).toHaveBeenCalled();
  });
});
