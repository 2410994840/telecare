import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../components/auth/Navbar';

const mockLogout = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: { name: 'Test User', role: 'patient' }, logout: mockLogout })
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

jest.mock('../hooks/useOfflineSync', () => ({
  useOfflineSync: () => ({ isOnline: true })
}));

const renderNavbar = (navItems = []) =>
  render(<MemoryRouter><Navbar navItems={navItems} /></MemoryRouter>);

describe('Navbar', () => {
  afterEach(() => jest.clearAllMocks());

  test('renders brand name', () => {
    renderNavbar();
    expect(screen.getByText('TeleCare')).toBeInTheDocument();
  });

  test('renders user name and role', () => {
    renderNavbar();
    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('patient')).toBeInTheDocument();
  });

  test('renders nav items', () => {
    renderNavbar([{ path: '/dashboard', label: 'Dashboard' }]);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  test('calls logout and navigates on logout click', () => {
    renderNavbar();
    fireEvent.click(screen.getAllByRole('button')[0]);
    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});
