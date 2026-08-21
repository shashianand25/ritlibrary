import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Header from '../Header.jsx';

const mockNavigate = vi.fn();
let mockLocation = { pathname: '/' };
let mockAuth = {
  user: null,
  isAdmin: false,
  isAuthLoading: false,
  signIn: vi.fn(),
  signOut: vi.fn(),
};

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
  };
});

vi.mock('../lib/AuthContext.jsx', () => ({
  useAuth: () => mockAuth,
}));

describe('Header component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocation = { pathname: '/' };
    mockAuth = {
      user: null,
      isAdmin: false,
      isAuthLoading: false,
      signIn: vi.fn(),
      signOut: vi.fn(),
    };
    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));
  });

  afterEach(() => {
    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));
  });

  it('renders navigation links and brand logo on desktop', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText(/RIT Library/i)).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Notes')).toBeInTheDocument();
    expect(screen.getByText('Syllabus')).toBeInTheDocument();
    expect(screen.getByText('Contribute')).toBeInTheDocument();
  });

  it('navigates to correct routes when desktop nav buttons and logo are clicked', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByText('About'));
    expect(mockNavigate).toHaveBeenCalledWith('/about');

    fireEvent.click(screen.getByText('Notes'));
    expect(mockNavigate).toHaveBeenCalledWith('/resources');

    fireEvent.click(screen.getByText('Syllabus'));
    expect(mockNavigate).toHaveBeenCalledWith('/syllabus');

    fireEvent.click(screen.getByText('Contribute'));
    expect(mockNavigate).toHaveBeenCalledWith('/contribute');

    fireEvent.click(screen.getByText(/RIT Library/i));
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('highlights the active navigation link based on current pathname', () => {
    mockLocation = { pathname: '/about' };
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const aboutBtn = screen.getByText('About');
    expect(aboutBtn.className).toContain('text-lime-400');

    const notesBtn = screen.getByText('Notes');
    expect(notesBtn.className).toContain('hover:text-blue-400');
  });

  it('hides Ramaiah logo on image error', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const ramaiahLogo = screen.getByAltText('Ramaiah Logo');
    expect(ramaiahLogo).toBeInTheDocument();
    fireEvent.error(ramaiahLogo);
    expect(ramaiahLogo.style.display).toBe('none');
  });

  it('renders loading spinner when isAuthLoading is true', () => {
    mockAuth.isAuthLoading = true;
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.queryByText(/Sign In/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Sign Out/i)).not.toBeInTheDocument();
  });

  it('renders sign in button when unauthenticated and triggers signIn on click', () => {
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const signInBtn = screen.getByRole('button', { name: /Sign In/i });
    expect(signInBtn).toBeInTheDocument();
    fireEvent.click(signInBtn);
    expect(mockAuth.signIn).toHaveBeenCalledTimes(1);
  });

  it('renders user details and avatar initials when logged in without photoURL', () => {
    mockAuth.user = {
      displayName: 'Shashi Anand',
      email: 'shashi@msrit.edu',
    };
    mockAuth.isAdmin = true;

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    expect(screen.getByText('Shashi Anand')).toBeInTheDocument();
    expect(screen.getByText('SA')).toBeInTheDocument();
  });

  it('computes avatar initials correctly from email fallback or empty user', () => {
    mockAuth.user = {
      email: 'user@msrit.edu',
    };

    const { rerender } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText('U')).toBeInTheDocument();

    mockAuth.user = {};
    rerender(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );
    expect(screen.getByText('?')).toBeInTheDocument();
  });

  it('renders photoURL image when available', () => {
    mockAuth.user = {
      displayName: 'Avatar User',
      email: 'avatar@msrit.edu',
      photoURL: 'https://example.com/avatar.jpg',
    };

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const avatarImg = screen.getByRole('button', { name: /Avatar User/i }).querySelector('img');
    expect(avatarImg).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('opens user menu dropdown on click and handles manage admins navigation for admin', () => {
    mockAuth.user = {
      displayName: 'Admin User',
      email: 'admin@msrit.edu',
    };
    mockAuth.isAdmin = true;

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const userChip = screen.getByRole('button', { name: /Admin User/i });
    fireEvent.click(userChip);

    expect(screen.getByText('admin@msrit.edu')).toBeInTheDocument();
    const manageAdminsBtn = screen.getByRole('button', { name: /Manage Admins/i });
    expect(manageAdminsBtn).toBeInTheDocument();

    // Hover styles
    fireEvent.mouseEnter(manageAdminsBtn);
    fireEvent.mouseLeave(manageAdminsBtn);

    fireEvent.click(manageAdminsBtn);
    expect(mockNavigate).toHaveBeenCalledWith('/admin');
  });

  it('handles sign out action from user dropdown', () => {
    mockAuth.user = {
      displayName: 'Standard User',
      email: 'std@msrit.edu',
    };
    mockAuth.isAdmin = false;

    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const userChip = screen.getByRole('button', { name: /Standard User/i });
    fireEvent.click(userChip);

    expect(screen.queryByRole('button', { name: /Manage Admins/i })).not.toBeInTheDocument();
    const signOutBtn = screen.getByRole('button', { name: /Sign Out/i });

    // Hover styles
    fireEvent.mouseEnter(signOutBtn);
    fireEvent.mouseLeave(signOutBtn);

    fireEvent.click(signOutBtn);
    expect(mockAuth.signOut).toHaveBeenCalledTimes(1);
  });

  it('handles small screen mobile menu toggle, navigation, and sign in', () => {
    window.innerWidth = 500;

    const { container } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    const hamburgerBtn = container.querySelector('button.text-white.p-1');
    expect(hamburgerBtn).toBeInTheDocument();

    // Open mobile menu
    fireEvent.click(hamburgerBtn);
    const aboutBtn = screen.getByRole('button', { name: /^About$/i });
    expect(aboutBtn).toBeInTheDocument();

    // Click mobile nav link
    fireEvent.click(screen.getByRole('button', { name: /^Notes$/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/resources');

    // Reopen and test mobile Sign In
    fireEvent.click(hamburgerBtn);
    const mobileSignInBtn = screen.getAllByRole('button', { name: /Sign In/i })[0];
    fireEvent.click(mobileSignInBtn);
    expect(mockAuth.signIn).toHaveBeenCalled();

    // Resize back to desktop closes mobile menu
    window.innerWidth = 1024;
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
  });

  it('handles small screen mobile menu sign out when user is authenticated', () => {
    window.innerWidth = 500;
    mockAuth.user = { displayName: 'Mobile User', email: 'mob@msrit.edu' };

    const { container } = render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>
    );

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    const hamburgerBtn = container.querySelector('button.text-white.p-1');

    // Open mobile menu
    fireEvent.click(hamburgerBtn);

    const mobileSignOutBtn = screen.getByRole('button', { name: /Sign Out/i });
    fireEvent.click(mobileSignOutBtn);
    expect(mockAuth.signOut).toHaveBeenCalled();
  });
});
