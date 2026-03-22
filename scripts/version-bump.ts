import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join } from 'path';

const args = process.argv.slice(2);
const shouldCommit = args.includes('--commit');
const targetVersion = args.find(arg => !arg.startsWith('--'));

const rootDir = join(import.meta.dirname, '..');
const manifestPath = join(rootDir, 'manifest.json');
const versionsPath = join(rootDir, 'versions.json');
const packagePath = join(rootDir, 'package.json');

const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
let newVersion;

if (targetVersion) {
  newVersion = targetVersion;
} else {
  const [major, minor, patch] = manifest.version.split('.').map(Number);
  newVersion = `${major}.${minor}.${patch + 1}`;
}

manifest.version = newVersion;
writeFileSync(manifestPath, JSON.stringify(manifest, null, '\t') + '\n');
console.log(`Bumped manifest.json to ${newVersion}`);

if (existsSync(packagePath)) {
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  packageJson.version = newVersion;
  writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  console.log(`Bumped package.json to ${newVersion}`);
}

if (existsSync(versionsPath)) {
  const versions = JSON.parse(readFileSync(versionsPath, 'utf8'));
  versions[newVersion] = manifest.minAppVersion;
  writeFileSync(versionsPath, JSON.stringify(versions, null, 2) + '\n');
  console.log(`Updated versions.json`);
}

if (shouldCommit) {
  execSync('git add manifest.json package.json versions.json', { stdio: 'inherit' });
  execSync(`git commit -m "release: v${newVersion}"`, { stdio: 'inherit' });
  execSync(`git tag v${newVersion}`, { stdio: 'inherit' });
  console.log(`Created commit and tag v${newVersion}`);
  console.log(`Push with: git push && git push --tags`);
}
