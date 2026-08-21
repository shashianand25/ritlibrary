import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SubjectChecklist from '../components/syllabus/SubjectChecklist.jsx';

describe('SubjectChecklist component', () => {
  const mockSubject = {
    code: '21CS32',
    name: 'Data Structures',
    credits: 4,
    units: [
      {
        unit: 'Unit 1',
        title: 'Introduction to Data Structures',
        topics: [{ id: 't1', text: 'Arrays and Pointers' }],
      },
    ],
  };

  const mockProgress = {
    totalTopics: 1,
    completedTopics: 1,
    percentage: 100,
  };

  it('renders subject title and units', () => {
    const onBack = vi.fn();
    const toggleTopic = vi.fn();
    const getSubjectProgress = vi.fn().mockReturnValue(mockProgress);

    render(
      <SubjectChecklist
        selectedSubject={mockSubject}
        onBack={onBack}
        checkedTopics={{}}
        toggleTopic={toggleTopic}
        getSubjectProgress={getSubjectProgress}
      />
    );

    expect(screen.getByText('Data Structures')).toBeInTheDocument();
    expect(screen.getByText(/21CS32/i)).toBeInTheDocument();
  });

  it('handles back button click', () => {
    const onBack = vi.fn();
    const getSubjectProgress = vi.fn().mockReturnValue(mockProgress);

    render(
      <SubjectChecklist
        selectedSubject={mockSubject}
        onBack={onBack}
        checkedTopics={{}}
        toggleTopic={vi.fn()}
        getSubjectProgress={getSubjectProgress}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /Back/i }));
    expect(onBack).toHaveBeenCalled();
  });
});
