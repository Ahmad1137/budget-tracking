import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BudgetForm from '../Budgets/BudgetForm';

jest.mock('../../utils/api', () => ({
  post: jest.fn(),
  put: jest.fn()
}));

const mockWallets = [
  { _id: '1', name: 'Personal Wallet' },
  { _id: '2', name: 'Business Wallet' }
];

describe('BudgetForm', () => {
  const mockOnAdd = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders budget form correctly', () => {
    render(
      <BudgetForm 
        wallets={mockWallets} 
        onAdd={mockOnAdd} 
        onCancel={mockOnCancel} 
      />
    );

    expect(screen.getByText('Set Budget')).toBeInTheDocument();
    expect(screen.getByLabelText('Category')).toBeInTheDocument();
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
  });

  it('handles form input changes', () => {
    render(
      <BudgetForm 
        wallets={mockWallets} 
        onAdd={mockOnAdd} 
        onCancel={mockOnCancel} 
      />
    );

    const categoryInput = screen.getByLabelText('Category');
    fireEvent.change(categoryInput, { target: { value: 'Food' } });
    expect(categoryInput.value).toBe('Food');
  });
});