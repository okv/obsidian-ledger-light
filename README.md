# Ledger Light

> ⚠️ **Work in Progress** - This plugin is under active development.
>
> Built with [opencode](https://opencode.ai) for exploration purposes.

Simple hledger integration for Obsidian. Add transactions and view your finances with minimal setup.

## Features

- **Quick Transaction Entry** - Add expenses/income via a simple form with account dropdowns
- **Auto-populated Accounts** - Account list is automatically read from your hledger journal file
- **Balanced Entries** - Transactions are automatically balanced; you only enter one amount, the second posting gets the opposite amount
- **Dashboard** - Monthly income/expense summary with account filtering

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
- **Currency symbol**: Symbol to prefix amounts (default: `€`)

## Journal File Format

Create a `transactions.ledger` file in your vault root. Example:

```ledger
; accounts
2024/01/01 Opening balance
    assets:cash          $100
    equity:opening

2024/01/15 Grocery shopping
    expenses:food        $25.50
    assets:cash         -$25.50

2024/01/20 Salary
    assets:bank         $3000
    income:salary
```

This plugin uses standard hledger/journal format. Accounts like `assets:cash`, `expenses:food`, and `income:salary` will appear in the transaction form dropdowns.

## Development

Requires **Node.js 22**.

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test
```

Built files go to root directory. The plugin entry point is `main.js`.

### Version Bumping

```bash
# Bump patch version (e.g., 0.3.0 → 0.3.1)
npm run bump

# Bump to specific version
npm run bump -- 0.4.0

# Bump version, commit, and create git tag
npm run bump -- --commit
```

After running `npm run bump -- --commit`, push with:
```bash
git push && git push --tags
```

GitHub Actions will automatically create the release.

### Release Process

1. Run `npm run bump -- --commit`
2. Push: `git push && git push --tags`
3. GitHub Actions creates the release automatically

## Acknowledgments

Inspired by [ledger-obsidian](https://github.com/tgrosinger/ledger-obsidian) by tgrosinger.

## License

MIT
