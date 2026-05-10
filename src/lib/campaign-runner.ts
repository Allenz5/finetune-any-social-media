import { run, setDefaultOpenAIClient, setOpenAIAPI } from '@openai/agents';
import OpenAI from 'openai';
import { createJobSearchingAgent } from './agents/jobSearchingAgent/agent';
import type { Logger, Platform } from './tools/types';

let clientReady = false;

async function ensureClient(): Promise<void> {
  if (clientReady) return;
  const result = await chrome.storage.local.get('openai_api_key');
  const apiKey = (result['openai_api_key'] as string) ?? '';
  if (!apiKey) throw new Error('OpenAI API key not set. Add it in Settings.');
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  setDefaultOpenAIClient(client);
  setOpenAIAPI('chat_completions');
  clientReady = true;
}

export class CampaignRunner {
  private controller = new AbortController();

  constructor(
    private readonly platform: Platform,
    private readonly campaignPrompt: string,
    private readonly log: Logger,
  ) {}

  stop(): void {
    this.controller.abort();
  }

  async run(): Promise<void> {
    this.log('info', 'Campaign started.');
    try {
      await ensureClient();
      const agent = createJobSearchingAgent(this.platform, this.log);
      await run(agent, `Campaign brief: ${this.campaignPrompt}`, {
        signal: this.controller.signal,
        maxTurns: 1000,
      });
      this.log('info', 'Campaign finished.');
    } catch (err) {
      if (this.controller.signal.aborted) {
        this.log('info', 'Campaign stopped.');
        return;
      }
      this.log('error', `Campaign failed: ${errMsg(err)}`);
    }
  }
}

function errMsg(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
