import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CircleLoader } from '../components/Loaders.jsx';

describe('Loaders component', () => {
  it('renders CircleLoader without crashing', () => {
    const { container } = render(<CircleLoader size={30} color="#A3E635" />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
