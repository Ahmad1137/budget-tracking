import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import { AuthContext } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import api from '../utils/api';

// Mock the API
jest.mock('../utils/api');

// Mock the chart components
jest.mock('../components/Charts/IncomeExpenseChart', () => {
  return function MockIncomeExpenseChart() {
    return <div data-testid="income-expense-chart">Income Expense Chart</div>;
  };
});

jest.mock('../components/Charts/MonthlyTransactionChart', () => {
  return function MockMonthlyTransactionChart() {
    return <div data-testid="monthly-transaction-chart">Monthly Transaction Chart</div>;
  };
});

const mockUser = {
  _id: '1',
  name: 'John Doe',
  email: 'john@example.com'
};

const renderDashboard = (user = mockUser) => {
  return render(
    <BrowserRouter>
      <ThemeProvider>
        <AuthContext.Provider value={{ user, loading: false }}>
          <Dashboard />
        </AuthContext.Provider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    api.get.mockResolvedValue({
      data: [
        { type: 'income', amount: 1000 },
        { type: 'expense', amount: 500 }
      ]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders dashboard with user name', async () => {
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, John!/)).toBeInTheDocument();
    });
  });

  test('displays financial stats correctly', async () => {
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText('Total Income')).toBeInTheDocument();
      expect(screen.getByText('Total Expenses')).toBeInTheDocument();
      expect(screen.getByText('Balance')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    api.get.mockRejectedValue(new Error('API Error'));
    
    renderDashboard();
    
    await waitFor(() => {
      expect(screen.getByText(/Welcome back, John!/)).toBeInTheDocument();
    });
  });
});