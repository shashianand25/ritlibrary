import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import HomeTagCloud from '../components/home/HomeTagCloud.jsx';

describe('HomeTagCloud component', () => {
  it('renders available tags and sections', () => {
    render(<HomeTagCloud />);

    expect(screen.getByText(/Available for/i)).toBeInTheDocument();
    expect(screen.getByText('CSE')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
  });
});
