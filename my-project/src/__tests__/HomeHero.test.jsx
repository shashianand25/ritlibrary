import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { describe, it, expect, vi } from 'vitest';
import HomeHero from '../components/home/HomeHero.jsx';

describe('HomeHero component', () => {
  it('renders hero title, badges, and interacts with primary CTA', () => {
    const onBrowse = vi.fn();
    const onSyllabus = vi.fn();
    render(
      <BrowserRouter>
        <HomeHero onBrowse={onBrowse} onSyllabus={onSyllabus} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Your Academic/i)).toBeInTheDocument();
    expect(screen.getByText(/Resource Hub/i)).toBeInTheDocument();
    expect(screen.getByText(/For RIT Students/i)).toBeInTheDocument();

    const cta = screen.getByRole('button', { name: /Browse Resources/i });
    expect(cta).toBeInTheDocument();
    fireEvent.click(cta);
    expect(onBrowse).toHaveBeenCalled();
  });
});
