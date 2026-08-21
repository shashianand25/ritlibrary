import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  FileIcon,
  StyledSelect,
  PillBtn,
  Dots,
  Dropdown,
  StyledInput,
  EmptyState,
  FolderSection,
} from '../components/UIElements.jsx';
import { FileText } from 'lucide-react';

describe('UIElements component library', () => {
  it('renders FileIcon for pdf and image files', () => {
    const { container: c1 } = render(
      <FileIcon fileName="syllabus.pdf" mimeType="application/pdf" />
    );
    expect(c1.querySelector('svg')).toBeInTheDocument();

    const { container: c2 } = render(<FileIcon fileName="screenshot.png" mimeType="image/png" />);
    expect(c2.querySelector('svg')).toBeInTheDocument();
  });

  it('renders StyledSelect with options and handles selection', () => {
    const onChange = vi.fn();
    render(
      <StyledSelect label="Choose Year" value="1" onChange={onChange}>
        <option value="1">1st Year</option>
        <option value="2">2nd Year</option>
      </StyledSelect>
    );

    expect(screen.getByText('Choose Year')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '2' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('renders PillBtn and fires onClick', () => {
    const handleClick = vi.fn();
    render(
      <PillBtn active={true} onClick={handleClick}>
        Click Me
      </PillBtn>
    );

    const button = screen.getByText('Click Me');
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalled();
  });

  it('renders Dots icon', () => {
    const { container } = render(<Dots size={24} color="#lime" />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders Dropdown and handles changes', () => {
    const onChange = vi.fn();
    render(
      <Dropdown label="Branch Selector" value="CS" onChange={onChange}>
        <option value="CS">Computer Science</option>
        <option value="IS">Information Science</option>
      </Dropdown>
    );

    expect(screen.getByText('Branch Selector')).toBeInTheDocument();
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'IS' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('renders StyledInput and passes props', () => {
    const onChange = vi.fn();
    render(<StyledInput placeholder="Search here..." value="AI" onChange={onChange} />);

    const input = screen.getByPlaceholderText('Search here...');
    expect(input.value).toBe('AI');
    fireEvent.change(input, { target: { value: 'AIML' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('renders EmptyState with custom label', () => {
    render(<EmptyState icon={FileText} label="Test Question Papers" />);
    expect(screen.getByText('No Test Question Papers found for this subject')).toBeInTheDocument();
  });

  it('renders FolderSection and toggles open/close on click', () => {
    render(
      <FolderSection title="Unit 1 Notes" count={3} initialOpen={false}>
        <div>File 1</div>
        <div>File 2</div>
      </FolderSection>
    );

    expect(screen.getByText('Unit 1 Notes')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.queryByText('File 1')).not.toBeInTheDocument();

    const toggleBtn = screen.getByRole('button');
    fireEvent.click(toggleBtn);
    expect(screen.getByText('File 1')).toBeInTheDocument();
  });
});
