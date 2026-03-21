import { App, TFile } from 'obsidian';

export interface TransactionEntry {
  date: string;
  description: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
}

export async function readJournalFile(app: App, path: string): Promise<string> {
  const file = app.vault.getAbstractFileByPath(path);
  if (!file) {
    return '';
  }
  if (file instanceof TFile) {
    return await app.vault.read(file);
  }
  return '';
}

export async function appendTransaction(
  app: App,
  path: string,
  entry: string
): Promise<void> {
  const file = app.vault.getAbstractFileByPath(path);
  if (file instanceof TFile) {
    const existing = await app.vault.read(file);
    const separator = existing.length === 0 ? '' : '\n';
    await app.vault.modify(file, existing + separator + entry + '\n');
  }
}

export async function ensureJournalFile(app: App, path: string): Promise<void> {
  const file = app.vault.getAbstractFileByPath(path);
  if (!file) {
    await app.vault.create(path, '');
  }
}

export function formatTransaction(entry: TransactionEntry): string {
  const date = formatDate(entry.date);
  const desc = entry.description || 'Transaction';
  const from = entry.fromAccount;
  const to = entry.toAccount;
  const amount = formatAmount(Math.abs(entry.amount), entry.currency);

  return `${date} ${desc}\n    ${from}    ${amount}\n    ${to}    -${amount}`;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

function formatAmount(amount: number, currency: string): string {
  return `${currency}${amount.toFixed(2)}`;
}
