import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SearchPYQ from '../searchpyq.jsx';

vi.mock('../Header.jsx', () => ({
  default: () => <div data-testid="mock-header">Header</div>,
}));

describe('SearchPYQ component', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ files: [] }),
      })
    );
  });

  it('renders search pyq page layout and filters', () => {
    render(<SearchPYQ />);
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByText('Guided Search')).toBeInTheDocument();
    expect(screen.getByText('Subject Code Search')).toBeInTheDocument();
  });
});
