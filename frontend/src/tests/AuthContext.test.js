import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { authService } from '../services';

jest.mock('../services', () => ({
  authService: {
    getMe: jest.fn(),
    login: jest.fn(),
    register: jest.fn()
  }
}));

const TestConsumer = () => {
  const { user, loading } = useAuth();
  if (loading) return <div>loading</div>;
  return <div>{user ? user.name : 'no user'}</div>;
};

describe('AuthContext', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => jest.clearAllMocks());

  test('shows no user when no token', async () => {
    await act(async () => render(<AuthProvider><TestConsumer /></AuthProvider>));
    expect(screen.getByText('no user')).toBeInTheDocument();
  });

  test('loads user from token on mount', async () => {
    localStorage.setItem('token', 'mock-token');
    authService.getMe.mockResolvedValue({ data: { name: 'Test User' } });

    await act(async () => render(<AuthProvider><TestConsumer /></AuthProvider>));
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  test('clears token if getMe fails', async () => {
    localStorage.setItem('token', 'bad-token');
    authService.getMe.mockRejectedValue(new Error('Unauthorized'));

    await act(async () => render(<AuthProvider><TestConsumer /></AuthProvider>));
    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByText('no user')).toBeInTheDocument();
  });
});
