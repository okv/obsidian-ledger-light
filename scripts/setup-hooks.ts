import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const rootDir = path.join(import.meta.dirname, '..');
const hooksDir = path.join(rootDir, 'hooks');
const preCommitPath = path.join(hooksDir, 'pre-commit');

if (!fs.existsSync(hooksDir)) {
  fs.mkdirSync(hooksDir, { recursive: true });
}

const hookContent = `#!/bin/sh
echo "*** Check types..." &&
npm run typecheck &&

echo "*** Run tests..." &&
npm test
`;

fs.writeFileSync(preCommitPath, hookContent);
fs.chmodSync(preCommitPath, 0o755);

execSync('git config core.hooksPath hooks', { cwd: rootDir });

console.log('Git hooks installed successfully.');
