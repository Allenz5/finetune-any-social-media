import { decideAction } from './gpt';
import type { LogEntry, PlatformAdapter } from './adapters/types';

type Logger = (status: LogEntry['status'], message: string) => void;

const DELAY_BETWEEN_POSTS_MS = 1500;
const DELAY_AFTER_SCROLL_MS = 2000;
const MAX_EMPTY_SCROLLS = 5;

export class CampaignRunner {
  private stopped = false;

  constructor(
    private readonly adapter: PlatformAdapter,
    private readonly campaignPrompt: string,
    private readonly log: Logger,
  ) {}

  stop() {
    this.stopped = true;
  }

  async run(): Promise<void> {
    let emptyScrolls = 0;
    this.log('info', 'Campaign started.');

    while (!this.stopped) {
      // Step 1: get next post
      let post;
      try {
        post = await this.adapter.getNextPost();
      } catch (err) {
        this.log('error', `getNextPost() threw: ${errMsg(err)}`);
        break;
      }

      if (!post) {
        if (++emptyScrolls > MAX_EMPTY_SCROLLS) {
          this.log('info', `No new posts after ${MAX_EMPTY_SCROLLS} scrolls. Stopping.`);
          break;
        }
        this.log('info', `No new posts visible (attempt ${emptyScrolls}/${MAX_EMPTY_SCROLLS}). Scrolling…`);
        await this.adapter.scroll();
        await sleep(DELAY_AFTER_SCROLL_MS);
        continue;
      }

      emptyScrolls = 0;
      const preview = post.text.length > 80 ? post.text.slice(0, 80) + '…' : post.text;
      this.log('info', `[Post ${post.id}] Author: ${post.author} | "${preview}"`);

      // Step 2: ask GPT
      let action: Awaited<ReturnType<typeof decideAction>>;
      try {
        action = await decideAction(post, this.campaignPrompt);
        this.log('info', `[Post ${post.id}] GPT decision → ${action}`);
      } catch (err) {
        this.log('error', `[Post ${post.id}] GPT failed: ${errMsg(err)}`);
        action = 'skip';
      }

      // Step 3: execute action
      try {
        if (action === 'like') await this.adapter.like();
        else if (action === 'dislike') await this.adapter.dislike();
        else await this.adapter.skip();
        this.log('success', `[Post ${post.id}] "${action}" done.`);
      } catch (err) {
        this.log('error', `[Post ${post.id}] "${action}" failed: ${errMsg(err)}`);
      }

      // Step 4: scroll
      try {
        await this.adapter.scroll();
      } catch (err) {
        this.log('error', `scroll() threw: ${errMsg(err)}`);
      }

      await sleep(DELAY_BETWEEN_POSTS_MS);
    }

    this.log('info', 'Campaign stopped.');
  }
}

function errMsg(err: unknown): string {
  if (err instanceof Error) return `${err.message}${err.stack ? '\n' + err.stack : ''}`;
  return String(err);
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}
