import { App, ItemView, WorkspaceLeaf } from 'obsidian';
import { parseTransactionsWithLines, ParsedTransactionWithLines } from './parser';
import { LedgerDashboardView, LEDGER_DASHBOARD_VIEW } from './dashboard';
import { readJournalFile, deleteTransaction } from './utils';

export const LEDGER_TRANSACTIONS_VIEW = 'ledger-transactions';

interface LedgerLightPlugin {
  openAddTransactionModal(): void;
}

export class LedgerTransactionsView extends ItemView {
  private transactions: ParsedTransactionWithLines[] = [];
  private currency: string = '€';
  private plugin: LedgerLightPlugin;

  constructor(leaf: WorkspaceLeaf, plugin: LedgerLightPlugin) {
    super(leaf);
    this.plugin = plugin;
  }

  getViewType(): string {
    return LEDGER_TRANSACTIONS_VIEW;
  }

  getDisplayText(): string {
    return 'Recent Transactions';
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
    const container = this.containerEl;
    container.empty();
    container.addClass('ledger-transactions');

    this.renderHeader(container);
    this.renderContent(container);
  }

  private renderHeader(container: HTMLElement): void {
    const header = container.createDiv('transactions-header');
    header.createEl('h2', { text: 'Recent Transactions' });
    
    const closeBtn = header.createEl('button', { text: 'Close' });
    closeBtn.addEventListener('click', () => {
      const dashboardLeaves = this.app.workspace.getLeavesOfType(LEDGER_DASHBOARD_VIEW);
      for (const leaf of dashboardLeaves) {
        const view = leaf.view as unknown as LedgerDashboardView;
        view.refresh();
      }
      this.leaf.detach();
    });
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
