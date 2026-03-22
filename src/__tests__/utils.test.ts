import { describe, it, expect, beforeEach } from 'vitest';
import { formatTransaction, deleteTransaction } from '../utils';
import { App, Vault } from './obsidian-mock';

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
    expect(result).toBe('2024/01/15 Groceries\n    expenses:food    €25.50\n    assets:cash    -€25.50');
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

describe('deleteTransaction', () => {
  let app: App;
  let vault: Vault;

  beforeEach(() => {
    app = new App();
    vault = app.vault;
  });

  it('removes transaction lines', async () => {
    vault.files.set('test.ledger', `2024/01/15 Groceries
    expenses:food        €25.50
    assets:cash`);

    await deleteTransaction(app as any, 'test.ledger', 0, 2);

    const content = vault.files.get('test.ledger');
    expect(content).toBe('');
  });

  it('removes only specified line range', async () => {
    vault.files.set('test.ledger', `2024/01/15 Groceries
    expenses:food        €25.50
    assets:cash

2024/01/20 Salary
    assets:bank         €3000
    income:salary`);

    await deleteTransaction(app as any, 'test.ledger', 0, 2);

    const content = vault.files.get('test.ledger');
    expect(content).toBe(`2024/01/20 Salary
    assets:bank         €3000
    income:salary`);
  });

  it('cleans up blank lines after removal', async () => {
    vault.files.set('test.ledger', `2024/01/15 Groceries
    expenses:food        €25.50
    assets:cash


2024/01/20 Salary
    assets:bank         €3000
    income:salary`);

    await deleteTransaction(app as any, 'test.ledger', 0, 2);

    const content = vault.files.get('test.ledger');
    expect(content).toBe(`2024/01/20 Salary
    assets:bank         €3000
    income:salary`);
  });

  it('handles non-existent file gracefully', async () => {
    await expect(deleteTransaction(app as any, 'nonexistent.ledger', 0, 2)).resolves.not.toThrow();
  });
});
