import { App, Modal } from 'obsidian';
import { parseTransactionsWithLines, ParsedTransactionWithLines } from './parser';
import { LedgerDashboardView, LEDGER_DASHBOARD_VIEW } from './dashboard';
import { readJournalFile, deleteTransaction } from './utils';

interface LedgerLightPlugin {
  openAddTransactionModal(): void;
}

export class LedgerTransactionsModal extends Modal {
  private transactions: ParsedTransactionWithLines[] = [];
  private currency: string = '€';
  private plugin: LedgerLightPlugin;

  constructor(app: App, plugin: LedgerLightPlugin) {
    super(app);
    this.plugin = plugin;
  }

  async onOpen(): Promise<void> {
    await this.loadData();
    this.render();
  }

  private async loadData(): Promise<void> {
    try {
      const app = this.app as App & { plugins: { getPlugin: (id: string) => { settings?: { currency: string } } | null } };
      const settings = app.plugins.getPlugin('ledger-light');
      this.currency = settings?.settings?.currency || '€';
    } catch {
      this.currency = '€';
    }
  }

  private render(): void {
    const container = this.contentEl;
    container.empty();
    container.addClass('ledger-transactions');

    this.renderHeader(container);
    this.renderContent(container);
  }

  private renderHeader(container: HTMLElement): void {
    container.createEl('h2', { text: 'Recent Transactions' });
  }

  private async renderContent(container: HTMLElement): Promise<void> {
    const content = container.createDiv('transactions-content');
    
    try {
      const app = this.app as App & { plugins: { getPlugin: (id: string) => { settings?: { journalPath: string } } | null } };
      const settings = app.plugins.getPlugin('ledger-light');
      const journalPath = settings?.settings?.journalPath || 'transactions.ledger';
      const fileContent = await readJournalFile(this.app, journalPath);
      this.transactions = parseTransactionsWithLines(fileContent);
      
      const recentTransactions = this.transactions
        .slice(-5)
        .reverse();
      
      if (recentTransactions.length === 0) {
        content.createEl('p', { text: 'No transactions yet' });
        return;
      }
      
      const list = content.createDiv('transactions-list');
      
      for (const tx of recentTransactions) {
        const item = list.createDiv('transaction-item');
        
        const amount = tx.postings.find(p => p.amount !== 0)?.amount || 0;
        const dateFormatted = tx.date.replace(/-/g, '/');
        const amountFormatted = `${this.currency}${Math.abs(amount).toFixed(2)}`;
        
        const info = item.createDiv('transaction-info');
        info.createEl('span', { text: `${dateFormatted} ${tx.description}` });
        info.createEl('span', { text: amountFormatted });
        
        const deleteBtn = item.createEl('button', { text: '[x]' });
        deleteBtn.addEventListener('click', async () => {
          const confirmed = confirm(`Delete transaction?\n"${tx.description} - ${amountFormatted}"`);
          if (confirmed) {
            await this.deleteTx(tx, journalPath);
          }
        });
      }
    } catch (error) {
      console.error('Failed to load transactions:', error);
      content.createEl('p', { text: 'Failed to load transactions' });
    }
  }

  private async deleteTx(tx: ParsedTransactionWithLines, journalPath: string): Promise<void> {
    await deleteTransaction(this.app, journalPath, tx.startLine, tx.endLine);
    this.render();
  }
}
