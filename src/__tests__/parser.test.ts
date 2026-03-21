import { describe, it, expect } from 'vitest';
import { parseJournalFile } from '../parser';

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
