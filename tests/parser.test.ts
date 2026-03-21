import { describe, it } from 'node:test';
import assert from 'node:assert';
import { parseJournalFile } from '../src/parser';

describe('parseJournalFile', () => {
  it('extracts accounts from journal entries', () => {
    const content = `2024/01/01 test
    expenses:food    $10
    assets:cash    -$10`;

    const { accounts, aliases } = parseJournalFile(content);

    assert.ok(accounts.includes('expenses:food'), 'should extract expenses:food');
    assert.ok(accounts.includes('assets:cash'), 'should extract assets:cash');
    assert.strictEqual(accounts.length, 2, 'should have exactly 2 accounts');
  });

  it('returns empty arrays for empty content', () => {
    const { accounts, aliases } = parseJournalFile('');

    assert.deepStrictEqual(accounts, [], 'should return empty array for empty content');
    assert.ok(aliases.size === 0, 'should have no aliases');
  });

  it('ignores lines starting with semicolons', () => {
    const content = `; this is a comment
    expenses:food    $10`;

    const { accounts } = parseJournalFile(content);

    assert.ok(accounts.includes('expenses:food'), 'should still extract accounts');
  });

  it('extracts aliases', () => {
    const content = `alias foo=expenses:food
alias bar=assets:cash`;

    const { aliases } = parseJournalFile(content);

    assert.strictEqual(aliases.get('foo'), 'expenses:food', 'should extract first alias');
    assert.strictEqual(aliases.get('bar'), 'assets:cash', 'should extract second alias');
  });

  it('sorts accounts alphabetically', () => {
    const content = `2024/01/01 test
    zebra    $10
    apple    $5`;

    const { accounts } = parseJournalFile(content);

    assert.deepStrictEqual(accounts, ['apple', 'zebra'], 'should be sorted alphabetically');
  });

  it('handles accounts with hyphens', () => {
    const content = `2024/01/01 test
    assets:bank-account    $100`;

    const { accounts } = parseJournalFile(content);

    assert.ok(accounts.includes('assets:bank-account'), 'should extract account with hyphen');
  });

  it('handles multiple currencies', () => {
    const content = `2024/01/01 test
    expenses:food    $10
    expenses:clothes    €20
    expenses:tech    £30`;

    const { accounts } = parseJournalFile(content);

    assert.strictEqual(accounts.length, 3, 'should extract all accounts regardless of currency');
  });

  it('ignores inline comments', () => {
    const content = `2024/01/01 test
    expenses:food    $10  ; this is a comment`;

    const { accounts } = parseJournalFile(content);

    assert.ok(accounts.includes('expenses:food'), 'should extract account before semicolon comment');
  });
});
