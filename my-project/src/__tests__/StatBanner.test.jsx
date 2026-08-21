import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import StatBanner from '../components/home/StatBanner.jsx';

describe('StatBanner component', () => {
  it('renders default platform statistics', () => {
    render(<StatBanner />);

    expect(screen.getByText('1,200+')).toBeInTheDocument();
    expect(screen.getByText('Study Notes & Modules')).toBeInTheDocument();
    expect(screen.getByText('Previous Year Question Papers')).toBeInTheDocument();
    expect(screen.getByText('8 Branches')).toBeInTheDocument();
  });

  it('renders custom stats when provided via props', () => {
    const customStats = [{ label: 'Custom Metric', value: '99.9%' }];

    render(<StatBanner stats={customStats} />);

    expect(screen.getByText('99.9%')).toBeInTheDocument();
    expect(screen.getByText('Custom Metric')).toBeInTheDocument();
    expect(screen.queryByText('1,200+')).not.toBeInTheDocument();
  });
});
