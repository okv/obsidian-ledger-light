# Ledger Light

> ⚠️ **Work in Progress** - This plugin is under active development.

Simple hledger integration for Obsidian. Add transactions and view your finances with minimal setup.

## Features

- **Quick Transaction Entry** - Add expenses/income via a simple form with account dropdowns
- **Auto-populated Accounts** - Account list is automatically read from your hledger journal file
- **Balanced Entries** - Transactions are automatically balanced per double-entry bookkeeping
- **Dashboard** (coming soon) - Monthly income/expense summary with account filtering

## Installation

### Using BRAT (Recommended for Testing)

1. Install [BRAT](https://obsidian.md/plugins?id=obsidian42-brat) from the Community Plugins
2. Open BRAT settings → "Add a beta plugin for testing"
3. Enter: `https://github.com/<username>/obsidian-ledger-light`
4. Enable "Ledger Light" in your Community Plugins settings

### Manual Installation

1. Download the latest release from GitHub
2. Copy the contents to `.obsidian/plugins/ledger-light/` in your vault
3. Enable "Ledger Light" in your Community Plugins settings

## Usage

### Add Transaction

1. Press `Ctrl+P` (or `Cmd+P` on Mac) to open the command palette
2. Search for "Add Transaction" and press Enter
3. Fill in the form:
   - **Date**: Transaction date (defaults to today)
   - **Description**: Optional note for the transaction
   - **Amount**: The monetary amount
   - **From Account**: Where the money comes from
   - **To Account**: Where the money goes to
4. Click "Add Transaction"

### Account Dropdowns

Accounts are automatically discovered by scanning your journal file for existing account names. Make sure your `transactions.ledger` file exists and contains at least one transaction with accounts.

## Configuration

In Obsidian Settings → Ledger Light:

- **Journal file path**: Path to your hledger journal file (default: `transactions.ledger`)
- **Currency symbol**: Symbol to prefix amounts (default: `$`)

## Journal File Format

Create a `transactions.ledger` file in your vault root. Example:

```ledger
; accounts
2024/01/01 Opening balance
    assets:cash          $100
    equity:opening

2024/01/15 Grocery shopping
    expenses:food        $25.50
    assets:cash

2024/01/20 Salary
    assets:bank         $3000
    income:salary
```

This plugin uses standard hledger/journal format. Accounts like `assets:cash`, `expenses:food`, and `income:salary` will appear in the transaction form dropdowns.

## Development

```bash
# Install dependencies
npm install

# Build (outputs to dist/)
npm run build

# Watch mode
npm run dev
```

Built files go to `dist/`. The plugin entry point is `dist/main.js`.

## License

MIT
