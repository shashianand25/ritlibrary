import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import UnitAccordion from '../components/syllabus/UnitAccordion.jsx';

describe('UnitAccordion component', () => {
  const mockUnit = {
    unit: 'Unit 1',
    title: 'Arrays and Linked Lists',
    topics: ['Singly Linked Lists', 'Doubly Linked Lists'],
  };

  it('renders unit and toggles open state on button click', () => {
    const toggleTopic = vi.fn();
    render(
      <UnitAccordion
        unit={mockUnit}
        index={0}
        isComplete={false}
        checkedCount={1}
        totalCount={2}
        subjectId="21CS32"
        subjectProgress={{}}
        toggleTopic={toggleTopic}
      />
    );

    expect(screen.getByText('Arrays and Linked Lists')).toBeInTheDocument();
    expect(screen.getByText(/1 \/ 2 Topics Completed/i)).toBeInTheDocument();

    // Click accordion header to open
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Singly Linked Lists')).toBeInTheDocument();
    expect(screen.getByText('Doubly Linked Lists')).toBeInTheDocument();
  });
});
