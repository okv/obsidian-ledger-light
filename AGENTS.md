# Ledger Light - Agent Instructions

## Overview
hledger plugin for Obsidian. Parses hledger journal files directly (no hledger CLI dependency).

## Tech Stack
- **Vanilla TypeScript** with esbuild bundling (single `main.js`)
- **Vitest** for testing
- **No framework dependencies** (vanilla Obsidian plugin API)

## Key Files
| File | Purpose |
|------|---------|
| `main.ts` | Entry point, settings, commands, Add Transaction modal |
| `parser.ts` | Journal parsing, account extraction |
| `utils.ts` | File I/O, transaction formatting, delete |
| `dashboard.ts` | Monthly income/expenses summary view |
| `transactions.ts` | Recent Transactions view (last 5, delete) |
| `styles.css` | All UI styling |

## Conventions
- Default currency: `€`
- Default journal file: `transactions.ledger`
- Auto-balance: write positive amount first, source account without amount
- Delete transactions: comment out with `; ` prefix
- After editing multiple source files: run `npm run build`
- Tests: `npm test`
- Type checking: run `npm run typecheck` before committing

## Release Workflow
1. `npm run bump -- --commit` (bumps patch version + commits)
2. Push + tag: `git tag v0.x.x && git push --tags`
3. GitHub Actions creates release → BRAT installs from release

## Project Status Tracking
When making changes to the project, update the status in this file to reflect:
- Completed features/tasks (mark as ✅)
- Pending features/tasks (mark as ❌)
- Known issues or limitations

## Current Status

### Core Features
- ✅ Settings tab (journal path, currency)
- ✅ Add Transaction modal with auto-populated account dropdowns
- ✅ Dashboard view (monthly income/expenses summary)
- ✅ Recent Transactions view (last 5 transactions with delete)
- ✅ Auto-refresh dashboard after adding transaction

### Testing
- ✅ Parser tests (31 tests passing)
- ✅ Tests for `parseTransactionsWithLines` (6 tests)
- ✅ Tests for `deleteTransaction` (4 tests)

### TypeScript
- ✅ TypeScript type checking in CI pipeline (`npm run typecheck`)

### Repository
- ✅ GitHub Actions CI/CD (Node.js 24 compatible)
- ✅ BRAT-compatible releases
- ✅ Version bump script
- ✅ README documentation

### Version
Current: 0.77.2
