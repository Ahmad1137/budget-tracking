import { handleApiError, validateRequired, formatCurrency, formatDate } from '../utils/errorHandler';

describe('Error Handler Utils', () => {
  describe('handleApiError', () => {
    test('handles response error with message', () => {
      const error = {
        response: {
          data: { msg: 'Server error message' }
        }
      };
      expect(handleApiError(error)).toBe('Server error message');
    });

    test('handles network error', () => {
      const error = {
        request: {}
      };
      expect(handleApiError(error)).toBe('Network error. Please check your connection.');
    });

    test('handles generic error', () => {
      const error = {
        message: 'Something went wrong'
      };
      expect(handleApiError(error)).toBe('Something went wrong');
    });

    test('uses default message when no specific error', () => {
      const error = {};
      expect(handleApiError(error, 'Default message')).toBe('Default message');
    });
  });

  describe('validateRequired', () => {
    test('returns errors for empty fields', () => {
      const fields = {
        name: '',
        email: null,
        amount: undefined
      };
      const errors = validateRequired(fields);
      expect(Object.keys(errors)).toHaveLength(3);
      expect(errors.name).toBe('Name is required');
      expect(errors.email).toBe('Email is required');
      expect(errors.amount).toBe('Amount is required');
    });

    test('returns no errors for valid fields', () => {
      const fields = {
        name: 'John',
        email: 'john@test.com',
        amount: 100
      };
      const errors = validateRequired(fields);
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  describe('formatCurrency', () => {
    test('formats valid numbers', () => {
      expect(formatCurrency(100)).toBe('$100.00');
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    test('handles invalid input', () => {
      expect(formatCurrency('invalid')).toBe('$0.00');
      expect(formatCurrency(null)).toBe('$0.00');
    });
  });

  describe('formatDate', () => {
    test('formats valid dates', () => {
      const date = new Date('2024-01-15');
      expect(formatDate(date)).toMatch(/Jan 15, 2024/);
    });

    test('handles invalid dates', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate('')).toBe('');
    });
  });
});