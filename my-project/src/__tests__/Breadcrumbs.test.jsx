import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

describe('Breadcrumbs component', () => {
  it('returns null when items is empty or null', () => {
    const { container: c1 } = render(
      <MemoryRouter>
        <Breadcrumbs items={[]} />
      </MemoryRouter>
    );
    expect(c1.firstChild).toBeNull();

    const { container: c2 } = render(
      <MemoryRouter>
        <Breadcrumbs items={null} />
      </MemoryRouter>
    );
    expect(c2.firstChild).toBeNull();
  });

  it('renders home link and intermediate breadcrumb links', () => {
    const items = [
      { label: 'Resources', to: '/resources' },
      { label: 'CSE', to: '/resources/cse' },
      { label: 'Unit 1 Notes' },
    ];

    render(
      <MemoryRouter>
        <Breadcrumbs items={items} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText('Home')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toHaveAttribute('href', '/resources');
    expect(screen.getByText('CSE')).toHaveAttribute('href', '/resources/cse');

    const lastItem = screen.getByText('Unit 1 Notes');
    expect(lastItem).toHaveAttribute('aria-current', 'page');
    expect(lastItem.tagName).toBe('SPAN');
  });
});
