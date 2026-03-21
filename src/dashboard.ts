import { App, ItemView, Notice, WorkspaceLeaf } from 'obsidian';
import {
  parseTransactions,
  isIncomeAccount,
  isExpenseAccount,
  ParsedTransaction,
  Posting
} from './parser';
import { readJournalFile } from './utils';

export const LEDGER_DASHBOARD_VIEW = 'ledger-dashboard';

interface AccountSummary {
  account: string;
  total: number;
}

interface MonthData {
  income: AccountSummary[];
  expenses: AccountSummary[];
  totalIncome: number;
  totalExpenses: number;
}

export class LedgerDashboardView extends ItemView {
  private transactions: ParsedTransaction[] = [];
  private currentMonth: Date;
  private selectedAccount: string = 'all';
  private accounts: string[] = [];

  constructor(leaf: WorkspaceLeaf, private app: App, private currency: string) {
    super(leaf);
    const now = new Date();
    this.currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  }

  getViewType(): string {
    return LEDGER_DASHBOARD_VIEW;
  }

  getDisplayText(): string {
    return 'Ledger Dashboard';
  }

  async onOpen(): Promise<void> {
    await this.loadData();
    this.render();
  }

  private async loadData(): Promise<void> {
    try {
      const settings = this.app.plugins.getPlugin('ledger-light');
      const journalPath = settings?.settings?.journalPath || 'transactions.ledger';
      const content = await readJournalFile(this.app, journalPath);
      
      this.transactions = parseTransactions(content);
      this.accounts = [...new Set(this.transactions.flatMap(t => t.postings.map(p => p.account)))].sort();
    } catch (error) {
      console.error('Failed to load journal:', error);
    }
  }

  private render(): void {
    const container = this.containerEl;
    container.empty();
    container.addClass('ledger-dashboard');

    this.renderHeader(container);
    this.renderContent(container);
  }

  private renderHeader(container: HTMLElement): void {
    const header = container.createDiv('dashboard-header');
    
    const monthNav = header.createDiv('month-nav');
    
    const prevBtn = monthNav.createEl('button', { text: '◀' });
    prevBtn.addEventListener('click', () => this.navigateMonth(-1));
    
    const monthLabel = monthNav.createSpan('month-label');
    monthLabel.setText(this.formatMonth(this.currentMonth));
    
    const nextBtn = monthNav.createEl('button', { text: '▶' });
    nextBtn.addEventListener('click', () => this.navigateMonth(1));

    const filterDiv = header.createDiv('account-filter');
    const filterLabel = filterDiv.createEl('label', { text: 'Account: ' });
    
    const select = filterDiv.createEl('select') as HTMLSelectElement;
    select.createEl('option', { text: 'All', attr: { value: 'all' } });
    for (const account of this.accounts) {
      select.createEl('option', { text: account, attr: { value: account } });
    }
    select.value = this.selectedAccount;
    select.addEventListener('change', () => {
      this.selectedAccount = select.value;
      this.render();
    });
  }

  private renderContent(container: HTMLElement): void {
    const content = container.createDiv('dashboard-content');
    const monthData = this.getMonthData();

    if (monthData.totalIncome === 0 && monthData.totalExpenses === 0) {
      content.createEl('p', { text: 'No transactions this month' });
      return;
    }

    this.renderSection(content, 'INCOME', monthData.income, monthData.totalIncome, false);
    this.renderSection(content, 'EXPENSES', monthData.expenses, monthData.totalExpenses, true);
    
    const net = monthData.totalIncome - Math.abs(monthData.totalExpenses);
    const netDiv = content.createDiv('net-section');
    netDiv.createEl('span', { text: 'NET' });
    const netValue = netDiv.createEl('span', { text: this.formatAmount(net) });
    netValue.addClass(net >= 0 ? 'positive' : 'negative');
  }

  private renderSection(
    container: HTMLElement,
    title: string,
    items: AccountSummary[],
    total: number,
    isExpense: boolean
  ): void {
    if (items.length === 0) return;

    const section = container.createDiv('dashboard-section');
    section.createEl('h3', { text: title });

    const list = section.createDiv('section-list');
    for (const item of items) {
      const row = list.createDiv('item-row');
      row.createEl('span', { text: item.account.replace(/^(income:|expenses:)/i, '') });
      const amount = isExpense ? -Math.abs(item.total) : item.total;
      row.createEl('span', { text: this.formatAmount(amount) });
    }

    const totalRow = list.createDiv('total-row');
    totalRow.createEl('span', { text: `Total ${title}` });
    totalRow.createEl('span', { text: this.formatAmount(total) });
  }

  private getMonthData(): MonthData {
    const monthStr = this.formatMonthKey(this.currentMonth);
    const monthTransactions = this.transactions.filter(t => t.date.startsWith(monthStr));
    
    const incomeMap = new Map<string, number>();
    const expenseMap = new Map<string, number>();

    for (const tx of monthTransactions) {
      for (const posting of tx.postings) {
        if (this.selectedAccount !== 'all' && posting.account !== this.selectedAccount) {
          continue;
        }

        if (isIncomeAccount(posting.account)) {
          incomeMap.set(posting.account, (incomeMap.get(posting.account) || 0) + posting.amount);
        } else if (isExpenseAccount(posting.account)) {
          expenseMap.set(posting.account, (expenseMap.get(posting.account) || 0) + posting.amount);
        }
      }
    }

    const toSummaryArray = (map: Map<string, number>): AccountSummary[] => {
      return Array.from(map.entries())
        .filter(([_, amount]) => amount !== 0)
        .map(([account, total]) => ({ account, total }))
        .sort((a, b) => a.account.localeCompare(b.account));
    };

    const income = toSummaryArray(incomeMap);
    const expenses = toSummaryArray(expenseMap);

    return {
      income,
      expenses,
      totalIncome: income.reduce((sum, item) => sum + item.total, 0),
      totalExpenses: expenses.reduce((sum, item) => sum + Math.abs(item.total), 0)
    };
  }

  private navigateMonth(delta: number): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + delta,
      1
    );
    this.render();
  }

  private formatMonth(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  private formatMonthKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }

  private formatAmount(amount: number): string {
    const sign = amount < 0 ? '-' : '';
    return `${sign}${this.currency}${Math.abs(amount).toFixed(2)}`;
  }
}
