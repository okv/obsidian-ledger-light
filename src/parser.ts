export interface AccountInfo {
  accounts: string[];
  aliases: Map<string, string>;
}

const ACCOUNT_LINE_REGEX = /^\s+([\w:][\w:\-\s]+?)\s+[-$€£¥]?\s*[\d,]+\.?\d*/;
const ALIAS_REGEX = /^alias\s+(\S+)\s*=\s*(.+)$/;

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

    const accountMatch = line.match(ACCOUNT_LINE_REGEX);
    if (accountMatch) {
      const account = accountMatch[1].trim();
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
