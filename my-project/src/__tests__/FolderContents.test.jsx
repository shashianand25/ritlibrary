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
});
