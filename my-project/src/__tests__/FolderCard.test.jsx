import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FolderCard from '../components/contribute/FolderCard.jsx';

describe('FolderCard component', () => {
  it('renders folder metadata and triggers view and upload actions', () => {
    const onUpload = vi.fn();
    const onView = vi.fn();
    const onRemove = vi.fn();

    render(
      <FolderCard
        name="Unit 1"
        count={5}
        isCustom={true}
        isActive={false}
        onUpload={onUpload}
        onRemove={onRemove}
        onView={onView}
      />
    );

    expect(screen.getByText('Unit 1')).toBeInTheDocument();
    expect(screen.getByText('5 files')).toBeInTheDocument();

    const viewBtn = screen.getByText(/View/i);
    fireEvent.click(viewBtn);
    expect(onView).toHaveBeenCalled();

    const uploadBtn = screen.getByText(/Upload/i);
    fireEvent.click(uploadBtn);
    expect(onUpload).toHaveBeenCalled();

    const removeBtn = screen.getByTitle('Remove custom folder');
    fireEvent.click(removeBtn);
    expect(onRemove).toHaveBeenCalled();
  });
});
