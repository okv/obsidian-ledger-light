import { App, Modal, Plugin, PluginSettingTab, Setting, WorkspaceLeaf } from 'obsidian';
import { parseJournalFile } from './parser';
import {
  readJournalFile,
  appendTransaction,
  ensureJournalFile,
  formatTransaction,
  TransactionEntry
} from './utils';
import { LedgerDashboardView, LEDGER_DASHBOARD_VIEW } from './dashboard';

interface LedgerSettings {
  journalPath: string;
  currency: string;
}

const DEFAULT_SETTINGS: LedgerSettings = {
  journalPath: 'transactions.ledger',
  currency: '€'
};

export default class LedgerLightPlugin extends Plugin {
  settings: LedgerSettings = DEFAULT_SETTINGS;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new LedgerSettingsTab(this.app, this));
    this.addCommand({
      id: 'add-transaction',
      name: 'Add Transaction',
      callback: () => this.openAddTransactionModal()
    });
    this.addCommand({
      id: 'open-dashboard',
      name: 'Open Dashboard',
      callback: () => this.openDashboard()
    });
    this.registerView(LEDGER_DASHBOARD_VIEW, (leaf) => new LedgerDashboardView(leaf, this.app, this.settings.currency));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async openAddTransactionModal() {
    const content = await readJournalFile(this.app, this.settings.journalPath);
    const { accounts } = parseJournalFile(content);
    new AddTransactionModal(this.app, this, accounts).open();
  }

  async openDashboard() {
    const { workspace } = this.app;
    let leaf: WorkspaceLeaf = workspace.getLeaf('tab');
    if (!leaf) {
      leaf = workspace.getLeaf(true);
    }
    await leaf.setViewState({ type: LEDGER_DASHBOARD_VIEW });
  }
}

class LedgerSettingsTab extends PluginSettingTab {
  constructor(app: App, private plugin: LedgerLightPlugin) {
    super(app, plugin);
  }

  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Ledger Light' });

    new Setting(containerEl)
      .setName('Journal file path')
      .setDesc('Path to your hledger journal file (e.g., transactions.ledger)')
      .addText(text =>
        text
          .setPlaceholder('transactions.ledger')
          .setValue(this.plugin.settings.journalPath)
          .onChange(async value => {
            this.plugin.settings.journalPath = value || 'transactions.ledger';
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName('Currency symbol')
      .setDesc('Symbol to use for amounts (e.g., $, €, £)')
      .addText(text =>
        text
          .setPlaceholder('€')
          .setValue(this.plugin.settings.currency)
          .onChange(async value => {
            this.plugin.settings.currency = value || '€';
            this.plugin.saveSettings();
          })
      );
  }
}

class AddTransactionModal extends Modal {
  private accounts: string[];

  constructor(app: App, private plugin: LedgerLightPlugin, accounts: string[]) {
    super(app);
    this.accounts = accounts;
  }

  async onOpen() {
    const { contentEl } = this;
    contentEl.addClass('ledger-light-modal');

    contentEl.createEl('h2', { text: 'Add Transaction' });

    const form = contentEl.createDiv('ledger-form');

    const dateRow = form.createDiv('form-row');
    dateRow.createEl('label', { text: 'Date' });
    const dateInput = dateRow.createEl('input', {
      attr: { type: 'date' }
    }) as HTMLInputElement;
    dateInput.value = this.formatDateForInput(new Date());

    const descRow = form.createDiv('form-row');
    descRow.createEl('label', { text: 'Description' });
    const descInput = descRow.createEl('input', {
      attr: { type: 'text', placeholder: 'Optional description' }
    }) as HTMLInputElement;

    const amountRow = form.createDiv('form-row');
    amountRow.createEl('label', { text: 'Amount' });
    const amountInput = amountRow.createEl('input', {
      attr: { type: 'number', step: '0.01', min: '0', placeholder: '0.00' }
    }) as HTMLInputElement;

    const fromRow = form.createDiv('form-row');
    fromRow.createEl('label', { text: 'From Account' });
    const fromSelect = this.createAccountSelect(fromRow);
    const defaultFrom = this.accounts.find(a => a.startsWith('assets:')) || this.accounts[0];
    fromSelect.value = defaultFrom;

    const toRow = form.createDiv('form-row');
    toRow.createEl('label', { text: 'To Account' });
    const toSelect = this.createAccountSelect(toRow);
    const defaultTo = this.accounts.find(a => a !== defaultFrom) || this.accounts[1] || '';
    if (defaultTo) toSelect.value = defaultTo;

    const buttonRow = form.createDiv('form-row');
    const submitBtn = buttonRow.createEl('button', {
      text: 'Add Transaction',
      cls: 'mod-cta'
    });

    submitBtn.addEventListener('click', async () => {
      const date = dateInput.value;
      const amount = parseFloat(amountInput.value);
      const fromAccount = fromSelect.value;
      const toAccount = toSelect.value;

      if (!date || !amount || !fromAccount || !toAccount) {
        return;
      }

      const entry: TransactionEntry = {
        date,
        description: descInput.value,
        fromAccount,
        toAccount,
        amount,
        currency: this.plugin.settings.currency
      };

      await ensureJournalFile(this.app, this.plugin.settings.journalPath);
      await appendTransaction(
        this.app,
        this.plugin.settings.journalPath,
        formatTransaction(entry)
      );

      this.close();
    });

    buttonRow.createEl('button', { text: 'Cancel' }).addEventListener('click', () => {
      this.close();
    });
  }

  private createAccountSelect(parent: HTMLElement): HTMLSelectElement {
    const select = parent.createEl('select') as HTMLSelectElement;
    select.createEl('option', { text: 'Select account...', attr: { value: '' } });

    for (const account of this.accounts) {
      select.createEl('option', { text: account, attr: { value: account } });
    }

    return select;
  }

  private formatDateForInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  onClose() {
    const { contentEl } = this;
    contentEl.empty();
  }
}
