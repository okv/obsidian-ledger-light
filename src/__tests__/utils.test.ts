import { describe, it, expect } from 'vitest';
import { formatTransaction } from '../utils';

describe('formatTransaction', () => {
  it('formats a basic transaction', () => {
    const entry = {
      date: '2024-01-15',
      description: 'Groceries',
      fromAccount: 'assets:cash',
      toAccount: 'expenses:food',
      amount: 25.50,
      currency: '€',
    };

    const result = formatTransaction(entry);
    expect(result).toBe('2024/01/15 Groceries\n    expenses:food    €25.50\n    assets:cash');
  });

  it('handles empty description', () => {
    const entry = {
      date: '2024-01-15',
      description: '',
      fromAccount: 'assets:cash',
      toAccount: 'expenses:food',
      amount: 10,
      currency: '€',
    };

    const result = formatTransaction(entry);
    expect(result).toContain('2024/01/15 Transaction');
    expect(result).toContain('€10.00');
  });

  it('uses absolute value for amount', () => {
    const entry = {
      date: '2024-01-15',
      description: 'Test',
      fromAccount: 'from',
      toAccount: 'to',
      amount: -50,
      currency: '€',
    };

    const result = formatTransaction(entry);
    expect(result).toContain('€50.00');
  });

  it('formats amount with 2 decimal places', () => {
    const entry = {
      date: '2024-01-15',
      description: 'Test',
      fromAccount: 'from',
      toAccount: 'to',
      amount: 10,
      currency: '€',
    };

    const result = formatTransaction(entry);
    expect(result).toContain('€10.00');
  });
});
