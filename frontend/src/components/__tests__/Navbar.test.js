import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import Navbar from '../Navbar';
import { AuthContext } from '../../context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';

const MockedNavbar = ({ user = null }) => (
  <BrowserRouter>
    <ThemeProvider>
      <AuthContext.Provider value={{ user, logout: jest.fn() }}>
        <Navbar />
      </AuthContext.Provider>
    </ThemeProvider>
  </BrowserRouter>
);

describe('Navbar', () => {
  it('renders brand name', () => {
    render(<MockedNavbar />);
    expect(screen.getByText('BudgetTracker')).toBeInTheDocument();
  });

  it('shows login/signup when user not logged in', () => {
    render(<MockedNavbar />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('shows navigation items when user is logged in', () => {
    const mockUser = { id: '1', name: 'Test User' };
    render(<MockedNavbar user={mockUser} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Transactions')).toBeInTheDocument();
  });
});