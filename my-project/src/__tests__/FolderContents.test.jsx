import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FolderContents from '../components/contribute/FolderContents.jsx';

describe('FolderContents component', () => {
  it('returns null when activeFolder is empty', () => {
    const { container } = render(<FolderContents activeFolder="" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders files in active folder and triggers delete for admin', () => {
    const onDelete = vi.fn();
    const mockFiles = [
      {
        id: 'f1',
        name: 'Math_Unit1.pdf',
        view: 'Math Unit 1',
        section: 'A',
        uploaderName: 'Alice',
        previewUrl: 'https://preview.url/1',
      },
    ];

    render(
      <FolderContents
        activeFolder="Unit 1"
        folderFiles={mockFiles}
        isAdmin={true}
        isDeleting={false}
        onDelete={onDelete}
      />
    );

    expect(screen.getByText('Math Unit 1')).toBeInTheDocument();
    expect(screen.getByText(/A · Alice/i)).toBeInTheDocument();

    const deleteBtn = screen.getByTitle('Delete file');
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith(mockFiles[0]);
  });

  it('triggers onClose when clicking close button or backdrop', () => {
    const onClose = vi.fn();
    const { container } = render(
      <FolderContents
        activeFolder="Unit 1"
        folderFiles={[]}
        isAdmin={false}
        onClose={onClose}
      />
    );

    const closeBtn = screen.getByTitle('Close');
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalledTimes(1);

    // Click backdrop
    const backdrop = container.firstChild;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it('displays deleteError and handles custom folder deletion', () => {
    const onRemoveFolder = vi.fn();
    render(
      <FolderContents
        activeFolder="Custom Notes"
        folderFiles={[]}
        isAdmin={true}
        deleteError="Failed to delete resource"
        isCustom={true}
        onRemoveFolder={onRemoveFolder}
      />
    );

    expect(screen.getByText('Failed to delete resource')).toBeInTheDocument();
    expect(screen.getByText('No files uploaded to this folder yet.')).toBeInTheDocument();

    const deleteFolderBtn = screen.getByTitle('Delete this custom folder');
    fireEvent.click(deleteFolderBtn);
    expect(onRemoveFolder).toHaveBeenCalledTimes(1);
  });
});
