import { chromium, type BrowserContext } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

export interface SessionOptions {
  platform: string;
  headless?: boolean;
}

export class BrowserSession {
  private context: BrowserContext | null = null;
  readonly profileDir: string;

  constructor(private opts: SessionOptions) {
    this.profileDir = path.resolve(process.cwd(), '.browser-profile', opts.platform);
  }

  async start(): Promise<BrowserContext> {
    if (this.context) return this.context;
    fs.mkdirSync(this.profileDir, { recursive: true });
    const context = await chromium.launchPersistentContext(this.profileDir, {
      headless: this.opts.headless ?? false,
      viewport: { width: 1280, height: 900 },
    });
    context.on('close', () => {
      if (this.context === context) this.context = null;
    });
    this.context = context;
    return context;
  }

  isRunning(): boolean {
    return this.context !== null;
  }

  getContext(): BrowserContext | null {
    return this.context;
  }

  async stop(): Promise<void> {
    const ctx = this.context;
    this.context = null;
    await ctx?.close();
  }
}
