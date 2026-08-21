import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import UploadModal from '../components/contribute/UploadModal.jsx';

let mockAuth = {
  user: {
    email: 'uploader@msrit.edu',
    displayName: 'Uploader',
    getIdToken: vi.fn().mockResolvedValue('fake-token'),
  },
  isAdmin: false,
};

vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => mockAuth,
}));

describe('UploadModal component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAuth = {
      user: {
        email: 'uploader@msrit.edu',
        displayName: 'Uploader',
        getIdToken: vi.fn().mockResolvedValue('fake-token'),
      },
      isAdmin: false,
    };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders upload modal and closes when X or backdrop is clicked', () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    const { container } = render(
      <UploadModal
        folder="Unit 1"
        subjectCode="21CS32"
        category="notes"
        branch="CS"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText('Upload to "Unit 1"')).toBeInTheDocument();
    expect(screen.getByText(/21CS32 · notes · Gen/i)).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close modal/i });
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Backdrop click
    const backdrop = container.firstChild;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('handles section selection change', () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <UploadModal
        folder="Unit 1"
        subjectCode="21CS32"
        category="notes"
        branch="cse"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const sectionSelect = screen.getByRole('combobox');
    fireEvent.change(sectionSelect, { target: { value: 'A' } });
    expect(sectionSelect.value).toBe('A');
  });

  it('handles drag and drop and file input selection', () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    const { container } = render(
      <UploadModal
        folder="Unit 1"
        subjectCode="21CS32"
        category="notes"
        branch="cse"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const dropZone = container.querySelector('.border-dashed');

    // Drag over
    fireEvent.dragOver(dropZone);
    // Drag leave
    fireEvent.dragLeave(dropZone);

    // Drop file
    const file = new File(['content'], 'lecture1.pdf', { type: 'application/pdf' });
    fireEvent.drop(dropZone, {
      dataTransfer: { files: [file] },
    });

    expect(screen.getByText('lecture1.pdf')).toBeInTheDocument();
  });

  it('performs successful upload via XMLHttpRequest', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    let capturedXHR = null;
    class MockXHR {
      constructor() {
        this.open = vi.fn();
        this.setRequestHeader = vi.fn();
        this.send = vi.fn();
        this.upload = { onprogress: null };
        this.status = 200;
        this.responseText = JSON.stringify({ file: { id: 'new-file-123', name: 'uploaded.pdf' } });
        capturedXHR = this;
      }
    }
    vi.stubGlobal('XMLHttpRequest', MockXHR);

    render(
      <UploadModal
        folder="Unit 1"
        subjectCode="21CS32"
        category="notes"
        branch="cse"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['pdf-content'], 'uploaded.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const uploadBtn = screen.getByRole('button', { name: /Upload Resource/i });
    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(capturedXHR).not.toBeNull();
      expect(capturedXHR.send).toHaveBeenCalled();
      expect(typeof capturedXHR.onload).toBe('function');
    });

    // Progress event
    if (capturedXHR.upload.onprogress) {
      capturedXHR.upload.onprogress({ lengthComputable: true, loaded: 50, total: 100 });
    }

    // Complete onload
    capturedXHR.onload();

    await waitFor(() => {
      expect(screen.getByText(/Resource uploaded successfully!/i)).toBeInTheDocument();
    });
  });

  it('handles upload errors and network errors', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    let capturedXHR = null;
    class MockXHR {
      constructor() {
        this.open = vi.fn();
        this.setRequestHeader = vi.fn();
        this.send = vi.fn();
        this.upload = {};
        this.status = 400;
        this.responseText = JSON.stringify({ error: 'File format not supported' });
        capturedXHR = this;
      }
    }
    vi.stubGlobal('XMLHttpRequest', MockXHR);

    render(
      <UploadModal
        folder="Unit 1"
        subjectCode="21CS32"
        category="notes"
        branch="cse"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const fileInput = document.querySelector('input[type="file"]');
    const file = new File(['bad-content'], 'bad.exe', { type: 'application/x-msdownload' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const uploadBtn = screen.getByRole('button', { name: /Upload Resource/i });
    fireEvent.click(uploadBtn);

    await waitFor(() => {
      expect(capturedXHR).not.toBeNull();
      expect(capturedXHR.send).toHaveBeenCalled();
      expect(typeof capturedXHR.onload).toBe('function');
    });

    capturedXHR.onload();

    await waitFor(() => {
      expect(screen.getByText('File format not supported')).toBeInTheDocument();
    });

    // Test Network Error
    capturedXHR.onerror();
    await waitFor(() => {
      expect(screen.getByText('Network error during upload')).toBeInTheDocument();
    });
  });

  it('rejects oversized files exceeding 50MB with user-friendly error message', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <UploadModal
        folder="Unit 1"
        subjectCode="21CS32"
        category="notes"
        branch="cse"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const fileInput = document.querySelector('input[type="file"]');
    const oversizedFile = new File(['x'.repeat(100)], 'huge.pdf', { type: 'application/pdf' });
    Object.defineProperty(oversizedFile, 'size', { value: 60 * 1024 * 1024 });

    fireEvent.change(fileInput, { target: { files: [oversizedFile] } });

    await waitFor(() => {
      expect(
        screen.getByText('File size exceeds maximum allowed limit of 50MB')
      ).toBeInTheDocument();
    });
  });
});
