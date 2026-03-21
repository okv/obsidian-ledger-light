export interface AccountInfo {
  accounts: string[];
  aliases: Map<string, string>;
}

export interface Posting {
  account: string;
  amount: number;
}

export interface ParsedTransaction {
  date: string;
  description: string;
  postings: Posting[];
}

const ACCOUNT_WITH_AMOUNT_REGEX = /^\s+([\w:][\w:\-]*)\s+([-+]?[€$£¥]?[\d,]+\.?\d*)/;
const ACCOUNT_NO_AMOUNT_REGEX = /^\s+([\w:][\w:\-]*)\s*$/;
const ALIAS_REGEX = /^alias\s+(\S+)\s*=\s*(.+)$/;
const TRANSACTION_LINE_REGEX = /^(\d{4}[/-]\d{2}[/-]\d{2})\s+(.+)/;

export function parseJournalFile(content: string): AccountInfo {
  const accountSet = new Set<string>();
  const aliases = new Map<string, string>();
  const lines = content.split('\n');

  for (const line of lines) {
    const aliasMatch = line.match(ALIAS_REGEX);
    if (aliasMatch) {
      aliases.set(aliasMatch[1].trim(), aliasMatch[2].trim());
      continue;
    }

    const postingMatch = line.match(ACCOUNT_WITH_AMOUNT_REGEX) || line.match(ACCOUNT_NO_AMOUNT_REGEX);
    if (postingMatch) {
      const account = postingMatch[1].trim();
      if (account && !account.startsWith(';')) {
        accountSet.add(account);
      }
    }
  }

  return {
    accounts: Array.from(accountSet).sort(),
    aliases
  };
}

export function isIncomeAccount(account: string): boolean {
  return account.toLowerCase().startsWith('income:');
}

export function isExpenseAccount(account: string): boolean {
  return account.toLowerCase().startsWith('expenses:');
}

export function parseTransactions(content: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = [];
  const lines = content.split('\n');
  let currentTransaction: ParsedTransaction | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine || trimmedLine.startsWith(';') || trimmedLine.startsWith('!') || trimmedLine.startsWith('#')) {
      continue;
    }

    const transactionMatch = trimmedLine.match(TRANSACTION_LINE_REGEX);
    if (transactionMatch) {
      if (currentTransaction) {
        transactions.push(currentTransaction);
      }
      const dateStr = transactionMatch[1].replace(/\//g, '-');
      currentTransaction = {
        date: dateStr,
        description: transactionMatch[2].trim(),
        postings: []
      };
      continue;
    }

    if (currentTransaction) {
      const postingMatch = line.match(ACCOUNT_WITH_AMOUNT_REGEX) || line.match(ACCOUNT_NO_AMOUNT_REGEX);
      if (postingMatch && postingMatch[1]) {
        const account = postingMatch[1].trim();
        let amount = 0;
        
        if (postingMatch[2]) {
          const amountStr = postingMatch[2].replace(/[,$€£¥]/g, '').trim();
          amount = parseFloat(amountStr) || 0;
        }
        
        currentTransaction.postings.push({ account, amount });
      }
    }
  }

  if (currentTransaction) {
    transactions.push(currentTransaction);
  }

  return transactions;
}
