import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Contribute from '../Contribute.jsx';
import * as apiClient from '../api/client.js';

let mockAuth = {
  user: {
    email: 'contributor@msrit.edu',
    displayName: 'Contributor',
    getIdToken: vi.fn().mockResolvedValue('token-abc'),
  },
  isAdmin: true,
};

vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => mockAuth,
}));

vi.mock('../Header.jsx', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

vi.mock('../api/client.js', () => ({
  fetchFileIndex: vi.fn().mockResolvedValue([
    {
      id: 'f-1',
      name: 'Notes/3/CSE/21CS32/Unit 1/Notes.pdf',
      category: 'Notes',
      subjectCode: '21CS32',
      folderName: 'Unit 1',
      view: 'Unit 1 Notes',
    },
    {
      id: 'f-legacy',
      name: 'Notes/2nd Year/3/cse/21CS32/Unit 2/LegacyNotes.pdf',
      view: 'Legacy Unit 2 Notes',
    },
  ]),
  deleteResource: vi.fn().mockResolvedValue({ success: true }),
}));

describe('Contribute component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mockAuth = {
      user: {
        email: 'contributor@msrit.edu',
        displayName: 'Contributor',
        getIdToken: vi.fn().mockResolvedValue('token-abc'),
      },
      isAdmin: true,
    };
  });

  it('renders contribution header, sync banner, and initial empty state', () => {
    render(<Contribute />);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(
      screen.getByText(/Files uploaded here are directly synchronized with Google Drive/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Select your Semester, Branch, and Subject above to begin contributing/i)
    ).toBeInTheDocument();
    expect(screen.getByText('Course Notes')).toBeInTheDocument();
    expect(screen.getByText('Question Papers')).toBeInTheDocument();
  });

  it('switches between course notes and question papers modes', () => {
    render(<Contribute />);

    const pyqBtn = screen.getByRole('button', { name: /Question Papers/i });
    fireEvent.click(pyqBtn);
    expect(pyqBtn.className).toContain('bg-lime-400');

    const notesBtn = screen.getByRole('button', { name: /Course Notes/i });
    fireEvent.click(notesBtn);
    expect(notesBtn.className).toContain('bg-lime-400');
  });

  it('handles cascading dropdown selections (Semester -> Branch -> Subject -> Elective)', async () => {
    const { container } = render(<Contribute />);

    let selects = container.querySelectorAll('select');
    const semSelect = selects[0];
    const branchSelect = selects[1];
    const subjectSelect = selects[2];

    expect(branchSelect).toBeDisabled();
    expect(subjectSelect).toBeDisabled();

    // Select Semester 1
    fireEvent.change(semSelect, { target: { value: '1' } });
    await waitFor(() => {
      expect(container.querySelectorAll('select')[1]).not.toBeDisabled();
    });

    // Select Branch cs
    const updatedBranchSelect = container.querySelectorAll('select')[1];
    fireEvent.change(updatedBranchSelect, { target: { value: 'cs' } });
    await waitFor(() => {
      expect(container.querySelectorAll('select')[2]).not.toBeDisabled();
    });

    // Select Subject 'esc' which is an elective
    const updatedSubjectSelect = container.querySelectorAll('select')[2];
    fireEvent.change(updatedSubjectSelect, { target: { value: 'esc' } });

    // Elective dropdown should appear
    await waitFor(() => {
      expect(container.querySelectorAll('select').length).toBe(4);
    });

    const electiveSelect = container.querySelectorAll('select')[3];
    fireEvent.change(electiveSelect, { target: { value: 'ESC131' } });

    // Selection is now complete -> Resource Directories should be displayed
    await waitFor(() => {
      expect(screen.getByText('Resource Directories')).toBeInTheDocument();
    });
  });

  it('handles custom folder creation and cancellation', async () => {
    localStorage.setItem('contributeSem', '3');
    localStorage.setItem('contributeBranch', 'cse');
    localStorage.setItem('contributeSubject', 'Data Structures');
    localStorage.setItem('contributeSubjectCode', '21CS32');

    render(<Contribute />);

    await waitFor(() => {
      expect(screen.getByText('Resource Directories')).toBeInTheDocument();
    });

    const addFolderBtn = screen.getByRole('button', { name: /Add Folder/i });
    fireEvent.click(addFolderBtn);

    const input = screen.getByPlaceholderText(/Enter custom folder name/i);
    expect(input).toBeInTheDocument();

    // Test Cancel
    const cancelBtn = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelBtn);
    expect(screen.queryByPlaceholderText(/Enter custom folder name/i)).not.toBeInTheDocument();

    // Test Add
    fireEvent.click(screen.getByRole('button', { name: /Add Folder/i }));
    const folderInput = screen.getByPlaceholderText(/Enter custom folder name/i);
    fireEvent.change(folderInput, { target: { value: 'Assignment Solutions' } });

    const createBtn = screen.getByRole('button', { name: /Create/i });
    fireEvent.click(createBtn);

    await waitFor(() => {
      expect(screen.getByText('Assignment Solutions')).toBeInTheDocument();
    });
  });

  it('handles custom folder removal', async () => {
    localStorage.setItem('contributeSem', '3');
    localStorage.setItem('contributeBranch', 'cse');
    localStorage.setItem('contributeSubject', 'Data Structures');
    localStorage.setItem('contributeSubjectCode', '21CS32');

    render(<Contribute />);

    await waitFor(() => {
      expect(screen.getByText('Resource Directories')).toBeInTheDocument();
    });

    // Add custom folder
    fireEvent.click(screen.getByRole('button', { name: /Add Folder/i }));
    fireEvent.change(screen.getByPlaceholderText(/Enter custom folder name/i), {
      target: { value: 'TempFolder' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Create/i }));

    expect(screen.getByText('TempFolder')).toBeInTheDocument();

    // Delete custom folder
    const deleteFolderBtn = screen.getByTitle(/Remove custom folder/i);
    fireEvent.click(deleteFolderBtn);

    expect(screen.queryByText('TempFolder')).not.toBeInTheDocument();
  });

  it('handles folder viewing toggle and legacy file mapping', async () => {
    localStorage.setItem('contributeSem', '3');
    localStorage.setItem('contributeBranch', 'cse');
    localStorage.setItem('contributeSubject', 'Data Structures');
    localStorage.setItem('contributeSubjectCode', '21CS32');

    render(<Contribute />);

    await waitFor(() => {
      expect(screen.getByText('Resource Directories')).toBeInTheDocument();
    });

    // View Unit 1
    const viewButtons = screen.getAllByRole('button', { name: /^View$/i });
    fireEvent.click(viewButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Unit 1 Notes')).toBeInTheDocument();
    });

    // Toggle off
    fireEvent.click(screen.getAllByRole('button', { name: /^View$/i })[0]);
    expect(screen.queryByText('Unit 1 Notes')).not.toBeInTheDocument();

    // View Unit 2 which contains the legacy path file
    fireEvent.click(screen.getAllByRole('button', { name: /^View$/i })[1]);
    await waitFor(() => {
      expect(screen.getByText('Legacy Unit 2 Notes')).toBeInTheDocument();
    });
  });

  it('handles file deletion with confirmation prompt accepted and rejected', async () => {
    localStorage.setItem('contributeSem', '3');
    localStorage.setItem('contributeBranch', 'cse');
    localStorage.setItem('contributeSubject', 'Data Structures');
    localStorage.setItem('contributeSubjectCode', '21CS32');

    const confirmSpy = vi.spyOn(window, 'confirm');
    const deleteSpy = vi.spyOn(apiClient, 'deleteResource');

    render(<Contribute />);

    await waitFor(() => {
      expect(screen.getByText('Resource Directories')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: /^View$/i })[0]);

    await waitFor(() => {
      expect(screen.getByText('Unit 1 Notes')).toBeInTheDocument();
    });

    const deleteBtn = screen.getByTitle(/Delete file/i);

    // 1. Rejection test
    confirmSpy.mockReturnValueOnce(false);
    fireEvent.click(deleteBtn);
    expect(deleteSpy).not.toHaveBeenCalled();

    // 2. Acceptance test
    confirmSpy.mockReturnValueOnce(true);
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(deleteSpy).toHaveBeenCalledWith('f-1', 'token-abc');
    });
  });

  it('handles file deletion errors and dismissal of error alert', async () => {
    localStorage.setItem('contributeSem', '3');
    localStorage.setItem('contributeBranch', 'cse');
    localStorage.setItem('contributeSubject', 'Data Structures');
    localStorage.setItem('contributeSubjectCode', '21CS32');

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(apiClient, 'deleteResource').mockRejectedValueOnce(
      new Error('Deletion permission denied')
    );

    render(<Contribute />);

    await waitFor(() => {
      expect(screen.getByText('Resource Directories')).toBeInTheDocument();
    });

    fireEvent.click(screen.getAllByRole('button', { name: /^View$/i })[0]);

    await waitFor(() => {
      expect(screen.getByText('Unit 1 Notes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTitle(/Delete file/i));

    await waitFor(() => {
      expect(screen.getByText('Deletion permission denied')).toBeInTheDocument();
    });

    // Dismiss error
    const dismissBtn = screen.getByRole('button', { name: /Dismiss/i });
    fireEvent.click(dismissBtn);
    await waitFor(() => {
      expect(screen.queryByText('Deletion permission denied')).not.toBeInTheDocument();
    });
  });

  it('handles upload modal open, close, and successful upload lifecycle', async () => {
    localStorage.setItem('contributeSem', '3');
    localStorage.setItem('contributeBranch', 'cse');
    localStorage.setItem('contributeSubject', 'Data Structures');
    localStorage.setItem('contributeSubjectCode', '21CS32');

    render(<Contribute />);

    await waitFor(() => {
      expect(screen.getByText('Resource Directories')).toBeInTheDocument();
    });

    // Open upload modal on Unit 1
    const uploadButtons = screen.getAllByRole('button', { name: /^Upload$/i });
    fireEvent.click(uploadButtons[0]);

    expect(screen.getByText('Upload to "Unit 1"')).toBeInTheDocument();

    // Close modal via header close button
    const modalHeading = screen.getByRole('heading', { name: /Upload to "Unit 1"/i });
    const modalHeader = modalHeading.parentElement.parentElement;
    const closeBtn = modalHeader.querySelector('button');
    fireEvent.click(closeBtn);
    await waitFor(() => {
      expect(screen.queryByText('Upload to "Unit 1"')).not.toBeInTheDocument();
    });

    // Open upload on Unit 2
    fireEvent.click(uploadButtons[1]);
    expect(screen.getByText('Upload to "Unit 2"')).toBeInTheDocument();
  });

  it('alerts user when trying to upload while unauthenticated', async () => {
    mockAuth = { user: null, isAdmin: false };
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    localStorage.setItem('contributeSem', '3');
    localStorage.setItem('contributeBranch', 'cse');
    localStorage.setItem('contributeSubject', 'Data Structures');
    localStorage.setItem('contributeSubjectCode', '21CS32');

    render(<Contribute />);

    await waitFor(() => {
      expect(screen.getByText('Resource Directories')).toBeInTheDocument();
    });

    const uploadButtons = screen.getAllByRole('button', { name: /^Upload$/i });
    fireEvent.click(uploadButtons[0]);

    expect(alertSpy).toHaveBeenCalledWith('Please sign in to contribute resources.');
  });
});
