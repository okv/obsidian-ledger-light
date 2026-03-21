import { describe, it } from 'node:test';
import assert from 'node:assert';
import { formatTransaction, formatDate, formatAmount, TransactionEntry } from '../src/utils';

describe('formatTransaction', () => {
  it('formats transaction with all fields', () => {
    const entry: TransactionEntry = {
      date: '2024-01-15',
      description: 'Groceries',
      fromAccount: 'assets:cash',
      toAccount: 'expenses:food',
      amount: 50.00,
      currency: '$'
    };

    const result = formatTransaction(entry);

    assert.ok(result.includes('2024/01/15'), 'should format date as YYYY/MM/DD');
    assert.ok(result.includes('Groceries'), 'should include description');
    assert.ok(result.includes('assets:cash'), 'should include from account');
    assert.ok(result.includes('expenses:food'), 'should include to account');
    assert.ok(result.includes('$50.00'), 'should include positive amount');
    assert.ok(result.includes('-$50.00'), 'should include negative amount');
  });

  it('uses default description when empty', () => {
    const entry: TransactionEntry = {
      date: '2024-01-15',
      description: '',
      fromAccount: 'assets:cash',
      toAccount: 'expenses:food',
      amount: 25.00,
      currency: '$'
    };

    const result = formatTransaction(entry);

    assert.ok(result.includes('Transaction'), 'should use default description');
  });

  it('formats amount with absolute value', () => {
    const entry: TransactionEntry = {
      date: '2024-01-15',
      description: 'Test',
      fromAccount: 'assets:cash',
      toAccount: 'expenses:food',
      amount: -50.00,
      currency: '€'
    };

    const result = formatTransaction(entry);

    assert.ok(result.includes('€50.00'), 'should use absolute value');
    assert.ok(result.includes('-€50.00'), 'should use negative absolute value');
  });

  it('handles decimal amounts correctly', () => {
    const entry: TransactionEntry = {
      date: '2024-01-15',
      description: 'Coffee',
      fromAccount: 'assets:cash',
      toAccount: 'expenses:food',
      amount: 4.50,
      currency: '$'
    };

    const result = formatTransaction(entry);

    assert.ok(result.includes('$4.50'), 'should format with 2 decimal places');
  });
});

describe('formatDate', () => {
  it('formats date as YYYY/MM/DD', () => {
    const result = formatDate('2024-01-05');

    assert.strictEqual(result, '2024/01/05');
  });

  it('pads single digit month and day', () => {
    const result = formatDate('2024-03-09');

    assert.strictEqual(result, '2024/03/09');
  });

  it('handles end of year', () => {
    const result = formatDate('2024-12-31');

    assert.strictEqual(result, '2024/12/31');
  });
});

describe('formatAmount', () => {
  it('formats amount with currency symbol', () => {
    const result = formatAmount(100, '$');

    assert.strictEqual(result, '$100.00');
  });

  it('formats with 2 decimal places', () => {
    const result = formatAmount(99.9, '€');

    assert.strictEqual(result, '€99.90');
  });

  it('handles different currencies', () => {
    assert.strictEqual(formatAmount(50, '£'), '£50.00');
    assert.strictEqual(formatAmount(50, '¥'), '¥50.00');
  });
});
