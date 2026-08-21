import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import SearchFilters from '../components/search/SearchFilters.jsx';

describe('SearchFilters component', () => {
  const defaultProps = {
    searchMode: 'guided',
    setSearchMode: vi.fn(),
    form: { year: '2nd Year', semester: '3', branch: 'cs', subject: '', subSubject: '' },
    setForm: vi.fn(),
    subjectCode: '',
    setSubjectCode: vi.fn(),
    codeError: '',
    handleSearch: vi.fn((e) => e.preventDefault()),
    isSearching: false,
    cycleTag: '',
    showElective: false,
    branchSubjects: [{ label: 'Data Structures', value: 'DS', code: 'BCS301' }],
    handleBranch: vi.fn(),
    handleSemester: vi.fn(),
    handleSubject: vi.fn(),
    handleSubSubject: vi.fn(),
    isSmallScreen: false,
  };

  it('renders mode switch and search button', () => {
    render(<SearchFilters {...defaultProps} />);

    expect(screen.getByText(/Guided Search/i)).toBeInTheDocument();
    expect(screen.getByText(/Subject Code Search/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search Resources/i })).toBeInTheDocument();
  });

  it('switches between guided and code search modes', () => {
    render(<SearchFilters {...defaultProps} searchMode="code" />);
    expect(screen.getByPlaceholderText(/Enter Subject Code/i)).toBeInTheDocument();
  });
});
