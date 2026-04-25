import type { BrowserContext, Page } from 'playwright';
import type { PlatformAdapter, Post } from './types';

const FEED_URL = 'https://www.linkedin.com/feed/';

export class LinkedInAdapter implements PlatformAdapter {
  readonly name = 'linkedin';

  constructor(private context: BrowserContext) {}

  private async getPage(): Promise<Page> {
    const pages = this.context.pages();
    return pages[0] ?? (await this.context.newPage());
  }

  async isLoggedIn(): Promise<boolean> {
    const page = await this.getPage();
    const url = page.url();
    if (!url.startsWith('http')) return false;
    return url.includes('linkedin.com/feed') && !url.includes('/login');
  }

  async navigateToFeed(): Promise<void> {
    const page = await this.getPage();
    await page.goto(FEED_URL, { waitUntil: 'domcontentloaded' });
  }

  async awaitLogin(timeoutMs = 10 * 60 * 1000): Promise<void> {
    const page = await this.getPage();
    await page.waitForURL(
      (url) => /linkedin\.com\/feed/.test(url.toString()),
      { timeout: timeoutMs },
    );
  }

  async getNextPost(): Promise<Post | null> {
    throw new Error('LinkedInAdapter.getNextPost: not implemented');
  }
  async like(): Promise<void> {
    throw new Error('LinkedInAdapter.like: not implemented');
  }
  async dislike(): Promise<void> {
    throw new Error('LinkedInAdapter.dislike: not implemented');
  }
  async skip(): Promise<void> {
    throw new Error('LinkedInAdapter.skip: not implemented');
  }
  async scroll(): Promise<void> {
    throw new Error('LinkedInAdapter.scroll: not implemented');
  }
}
