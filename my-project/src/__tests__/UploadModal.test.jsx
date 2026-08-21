import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UploadModal from '../components/contribute/UploadModal.jsx';

vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => ({
    user: {
      email: 'uploader@msrit.edu',
      displayName: 'Uploader',
      getIdToken: vi.fn().mockResolvedValue('fake-token'),
    },
    isAdmin: false,
  }),
}));

describe('UploadModal component', () => {
  it('renders upload modal and closes when X is clicked', () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
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

    const closeBtn = screen.getAllByRole('button')[0];
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });
});
