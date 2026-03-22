import { describe, it, expect } from 'vitest';
import { parseJournalFile, parseTransactions, parseTransactionsWithLines, isIncomeAccount, isExpenseAccount } from '../parser';

describe('parseJournalFile', () => {
  it('extracts accounts from posting lines', () => {
    const content = `
2024/01/01 Opening balance
    assets:cash          $100
    equity:opening
`;
    const result = parseJournalFile(content);
    expect(result.accounts).toContain('assets:cash');
    expect(result.accounts).toContain('equity:opening');
  });

  it('returns accounts sorted alphabetically', () => {
    const content = `
2024/01/01 Test
    expenses:food        $10
    assets:cash
    income:salary
`;
    const result = parseJournalFile(content);
    expect(result.accounts).toEqual(['assets:cash', 'expenses:food', 'income:salary']);
  });

  it('parses aliases', () => {
    const content = `
alias c=assets:cash
alias f=expenses:food
`;
    const result = parseJournalFile(content);
    expect(result.aliases.get('c')).toBe('assets:cash');
    expect(result.aliases.get('f')).toBe('expenses:food');
  });

  it('ignores comment lines', () => {
    const content = `
; this is a comment
2024/01/01 Test
    expenses:food        $10
    assets:cash
`;
    const result = parseJournalFile(content);
    expect(result.accounts).toContain('assets:cash');
    expect(result.accounts).toContain('expenses:food');
    expect(result.accounts.length).toBe(2);
  });

  it('handles empty content', () => {
    const result = parseJournalFile('');
    expect(result.accounts).toEqual([]);
    expect(result.aliases.size).toBe(0);
  });

  it('handles various currencies', () => {
    const content = `
2024/01/01 Test
    assets:usd         $100
    assets:eur         €100
    assets:gbp         £100
    assets:jpy         ¥100
    expenses:test
`;
    const result = parseJournalFile(content);
    expect(result.accounts.length).toBe(5);
  });
});

describe('isIncomeAccount', () => {
  it('returns true for accounts starting with income:', () => {
    expect(isIncomeAccount('income:salary')).toBe(true);
    expect(isIncomeAccount('Income:Salary')).toBe(true);
  });

  it('returns false for other accounts', () => {
    expect(isIncomeAccount('expenses:food')).toBe(false);
    expect(isIncomeAccount('assets:cash')).toBe(false);
  });
});

describe('isExpenseAccount', () => {
  it('returns true for accounts starting with expenses:', () => {
    expect(isExpenseAccount('expenses:food')).toBe(true);
    expect(isExpenseAccount('Expenses:Groceries')).toBe(true);
  });

  it('returns false for other accounts', () => {
    expect(isExpenseAccount('income:salary')).toBe(false);
    expect(isExpenseAccount('assets:cash')).toBe(false);
  });
});

describe('parseTransactions', () => {
  it('parses a simple transaction', () => {
    const content = `
2024/01/15 Groceries
    expenses:food        €25.50
    assets:cash
`;
    const result = parseTransactions(content);
    expect(result.length).toBe(1);
    expect(result[0].date).toBe('2024-01-15');
    expect(result[0].description).toBe('Groceries');
    expect(result[0].postings.length).toBe(2);
  });

  it('extracts amounts from postings', () => {
    const content = `
2024/01/15 Salary
    assets:bank         €3000
    income:salary
`;
    const result = parseTransactions(content);
    expect(result[0].postings[0].account).toBe('assets:bank');
    expect(result[0].postings[0].amount).toBe(3000);
    expect(result[0].postings[1].account).toBe('income:salary');
    expect(result[0].postings[1].amount).toBe(0);
  });

  it('handles multiple transactions', () => {
    const content = `
2024/01/15 Groceries
    expenses:food        €25.50
    assets:cash

2024/01/20 Salary
    assets:bank         €3000
    income:salary
`;
    const result = parseTransactions(content);
    expect(result.length).toBe(2);
    expect(result[0].description).toBe('Groceries');
    expect(result[1].description).toBe('Salary');
  });

  it('ignores comment lines', () => {
    const content = `
; comment line
2024/01/15 Groceries
    expenses:food        €25.50
    assets:cash
`;
    const result = parseTransactions(content);
    expect(result.length).toBe(1);
  });

  it('handles empty content', () => {
    const result = parseTransactions('');
    expect(result.length).toBe(0);
  });

  it('parses dates with slashes', () => {
    const content = `
2024/01/15 Test
    expenses:test        €10
    assets:cash
`;
    const result = parseTransactions(content);
    expect(result[0].date).toBe('2024-01-15');
  });

  it('handles negative amounts', () => {
    const content = `
2024/01/15 Refund
    assets:cash         -€25.50
    expenses:food
`;
    const result = parseTransactions(content);
    expect(result[0].postings[0].amount).toBe(-25.50);
  });
});

describe('parseTransactionsWithLines', () => {
  it('parses a simple transaction with correct line numbers', () => {
    const content = `2024/01/15 Groceries
    expenses:food        €25.50
    assets:cash`;
    const result = parseTransactionsWithLines(content);
    expect(result.length).toBe(1);
    expect(result[0].startLine).toBe(0);
    expect(result[0].endLine).toBe(2);
  });

  it('tracks line numbers for multiple transactions', () => {
    const content = `2024/01/15 Groceries
    expenses:food        €25.50
    assets:cash

2024/01/20 Salary
    assets:bank         €3000
    income:salary`;
    const result = parseTransactionsWithLines(content);
    expect(result.length).toBe(2);
    expect(result[0].startLine).toBe(0);
    expect(result[0].endLine).toBe(3);
    expect(result[1].startLine).toBe(4);
    expect(result[1].endLine).toBe(6);
  });

  it('skips comment lines in line number tracking', () => {
    const content = `; comment line
2024/01/15 Groceries
    expenses:food        €25.50
    assets:cash`;
    const result = parseTransactionsWithLines(content);
    expect(result.length).toBe(1);
    expect(result[0].startLine).toBe(1);
    expect(result[0].endLine).toBe(3);
  });

  it('skips blank lines in line number tracking', () => {
    const content = `

2024/01/15 Groceries
    expenses:food        €25.50
    assets:cash`;
    const result = parseTransactionsWithLines(content);
    expect(result.length).toBe(1);
    expect(result[0].startLine).toBe(2);
  });

  it('handles empty content', () => {
    const result = parseTransactionsWithLines('');
    expect(result.length).toBe(0);
  });

  it('handles content with only comments and blanks', () => {
    const content = `; comment
# another comment
! price directive`;
    const result = parseTransactionsWithLines(content);
    expect(result.length).toBe(0);
  });
});
