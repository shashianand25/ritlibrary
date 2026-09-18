import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import DrivePreview, { getStoredText, clearStoredText } from '../pdf.jsx';
import * as pdfjsLib from 'pdfjs-dist';

vi.mock('pdfjs-dist', () => {
  return {
    GlobalWorkerOptions: { workerSrc: '' },
    version: '3.11.174',
    getDocument: vi.fn(),
  };
});

describe('DrivePreview text pre-extraction and instant copy', () => {
  const mockFileId = 'test-file-123';
  const mockFileName = 'DBMS_Unit1.pdf';

  beforeEach(() => {
    clearStoredText();
    vi.clearAllMocks();

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  afterEach(() => {
    clearStoredText();
    vi.restoreAllMocks();
  });

  it('renders DrivePreview header, iframe, and action buttons', () => {
    const onClose = vi.fn();
    render(
      <DrivePreview
        fileId={mockFileId}
        fileName={mockFileName}
        mimeType="application/pdf"
        onClose={onClose}
      />
    );

    expect(screen.getByText(mockFileName)).toBeInTheDocument();
    expect(screen.getByTitle('Drive PDF Preview')).toHaveAttribute(
      'src',
      `https://drive.google.com/file/d/${mockFileId}/preview`
    );
    expect(screen.getByRole('button', { name: /Copy Prompt/i })).toBeInTheDocument();
    expect(screen.getByTitle('Download')).toBeInTheDocument();
    expect(screen.getByTitle('Close')).toBeInTheDocument();
  });

  it('pre-extracts text on file open so clicking copy is instant', async () => {
    const onClose = vi.fn();
    const mockArrayBuffer = new ArrayBuffer(8);
    const mockPageText = 'Database Management System Architecture';

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      })
    );

    pdfjsLib.getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getTextContent: vi.fn().mockResolvedValue({
            items: [{ str: mockPageText }],
          }),
        }),
      }),
    });

    render(
      <DrivePreview
        fileId={mockFileId}
        fileName={mockFileName}
        mimeType="application/pdf"
        onClose={onClose}
      />
    );

    // Verify background extraction completed and stored text in variable
    await waitFor(() => {
      expect(getStoredText()).toContain(mockPageText);
    });

    // Click Copy Prompt - should copy instantly without delay
    const copyButton = screen.getByRole('button', { name: /Copy Prompt/i });
    fireEvent.click(copyButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(getStoredText());
    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('discards text and makes variable empty on close', async () => {
    const onClose = vi.fn();
    const mockArrayBuffer = new ArrayBuffer(8);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(mockArrayBuffer),
      })
    );

    pdfjsLib.getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getTextContent: vi.fn().mockResolvedValue({
            items: [{ str: 'Sample Notes Page 1' }],
          }),
        }),
      }),
    });

    render(
      <DrivePreview
        fileId={mockFileId}
        fileName={mockFileName}
        mimeType="application/pdf"
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(getStoredText()).not.toBe('');
    });

    // Click close button
    const closeButton = screen.getByTitle('Close');
    fireEvent.click(closeButton);

    expect(onClose).toHaveBeenCalled();
    // Verify variable is empty
    expect(getStoredText()).toBe('');
  });

  it('discards text and makes variable empty on component unmount', async () => {
    const onClose = vi.fn();

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: vi.fn().mockResolvedValue(new ArrayBuffer(8)),
      })
    );

    pdfjsLib.getDocument.mockReturnValue({
      promise: Promise.resolve({
        numPages: 1,
        getPage: vi.fn().mockResolvedValue({
          getTextContent: vi.fn().mockResolvedValue({
            items: [{ str: 'Unmount text test' }],
          }),
        }),
      }),
    });

    const { unmount } = render(
      <DrivePreview
        fileId={mockFileId}
        fileName={mockFileName}
        mimeType="application/pdf"
        onClose={onClose}
      />
    );

    await waitFor(() => {
      expect(getStoredText()).toContain('Unmount text test');
    });

    unmount();
    expect(getStoredText()).toBe('');
  });

  it('fails silently without displaying error messages when extraction fails', async () => {
    const onClose = vi.fn();

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network connection failed')));

    render(
      <DrivePreview
        fileId={mockFileId}
        fileName={mockFileName}
        mimeType="application/pdf"
        onClose={onClose}
      />
    );

    // Assert no error messages or failure states are shown in the DOM
    await waitFor(() => {
      expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/network/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
      expect(getStoredText()).toBe('');
    });

    // Clicking copy when extraction failed silently stays idle and displays no error
    const copyButton = screen.getByRole('button', { name: /Copy Prompt/i });
    fireEvent.click(copyButton);

    await waitFor(() => {
      expect(screen.queryByText(/failed/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });
});
