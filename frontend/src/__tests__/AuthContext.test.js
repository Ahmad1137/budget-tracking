import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../context/AuthContext';
import { useContext } from 'react';
import api from '../utils/api';

jest.mock('../utils/api');

const TestComponent = () => {
  const { user, loading, login, logout } = useContext(AuthContext);
  
  return (
    <div>
      <div data-testid="loading">{loading ? 'loading' : 'not loading'}</div>
      <div data-testid="user">{user ? user.name : 'no user'}</div>
      <button onClick={() => login('test@test.com', 'password')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('initializes with no user when no token', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('not loading');
      expect(screen.getByTestId('user')).toHaveTextContent('no user');
    });
  });

  test('checks authentication on mount with valid token', async () => {
    localStorage.setItem('token', 'valid-token');
    api.get.mockResolvedValue({
      data: { _id: '1', name: 'John Doe', email: 'john@test.com' }
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('John Doe');
    });
  });

  test('removes invalid token on failed auth check', async () => {
    localStorage.setItem('token', 'invalid-token');
    api.get.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
      expect(screen.getByTestId('user')).toHaveTextContent('no user');
    });
  });
});