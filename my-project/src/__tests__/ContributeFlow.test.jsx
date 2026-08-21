import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Contribute from '../Contribute.jsx';
import * as apiClient from '../api/client.js';

vi.mock('../Header.jsx', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: {
      email: 'admin@msrit.edu',
      displayName: 'Admin User',
      getIdToken: vi.fn().mockResolvedValue('token-123'),
    },
    isAdmin: true,
    isAuthLoading: false,
  }),
}));

describe('Contribute Integration Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('completes the full selection, directory navigation, and file deletion workflow', async () => {
    const mockFiles = [
      {
        id: 'file-1',
        name: 'Notes/3/CSE/21CS32/Unit 1/Arrays.pdf',
        category: 'Notes',
        subjectCode: '21CS32',
        folderName: 'Unit 1',
        view: 'Arrays & Lists',
      },
    ];

    vi.spyOn(apiClient, 'fetchFileIndex').mockResolvedValue(mockFiles);
    const deleteSpy = vi.spyOn(apiClient, 'deleteResource').mockResolvedValue({ success: true });
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    localStorage.setItem('contributeSem', '3');
    localStorage.setItem('contributeBranch', 'cse');
    localStorage.setItem('contributeSubject', 'Data Structures');
    localStorage.setItem('contributeSubjectCode', '21CS32');

    render(<Contribute />);

    // 1. Verify Header and Directories are rendered
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Resource Directories')).toBeInTheDocument();
    });

    // 2. Open Unit 1 folder contents via View button
    const viewButtons = screen.getAllByRole('button', { name: /View/i });
    expect(viewButtons.length).toBeGreaterThan(0);
    fireEvent.click(viewButtons[0]);

    // 3. Verify file is listed inside active folder
    await waitFor(() => {
      expect(screen.getByText(/Arrays & Lists/i)).toBeInTheDocument();
    });

    // 4. Trigger Delete action
    const deleteBtn = screen.getByTitle(/Delete file/i);
    expect(deleteBtn).toBeInTheDocument();
    fireEvent.click(deleteBtn);

    // 5. Verify API client was called with correct file ID and auth token
    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('file-1', 'token-123');
    });
  });
});
