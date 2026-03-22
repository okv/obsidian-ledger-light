import { vi } from 'vitest';

export class TFile {
  constructor(public path: string = 'test.ledger') {}
}

export class Vault {
  files: Map<string, string> = new Map();

  getAbstractFileByPath(path: string) {
    if (this.files.has(path)) {
      return new TFile(path);
    }
    return null;
  }

  async read(file: TFile): Promise<string> {
    return this.files.get(file.path) ?? '';
  }

  async modify(file: TFile, content: string): Promise<void> {
    this.files.set(file.path, content);
  }

  async create(path: string, content: string): Promise<TFile> {
    this.files.set(path, content);
    return new TFile(path);
  }
}

export class App {
  vault = new Vault();
}

export class Modal {}
export class Plugin {}
export class PluginSettingTab {}
export function setIcon() {}
