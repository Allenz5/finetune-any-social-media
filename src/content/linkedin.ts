import { LinkedInAdapter } from './linkedin-adapter';
import { CampaignRunner } from '../lib/campaign-runner';
import type { LogEntry } from '../lib/adapters/types';

interface Campaign {
  id: string;
  name: string;
  prompt: string;
  running: boolean;
}

const runners = new Map<string, CampaignRunner>();

function createLogger(campaignId: string) {
  return (status: LogEntry['status'], message: string) => {
    const entry: LogEntry = { timestamp: Date.now(), status, message };
    chrome.runtime.sendMessage({ type: 'campaign:log', campaignId, entry }).catch(() => {
      // Side panel may not be open
    });
  };
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === 'campaign:start') {
    const campaign = msg.campaign as Campaign;
    if (!runners.has(campaign.id)) {
      const log = createLogger(campaign.id);
      const runner = new CampaignRunner(new LinkedInAdapter(), campaign.prompt, log);
      runners.set(campaign.id, runner);
      runner.run().catch(err => log('error', String(err)));
    }
    sendResponse({ ok: true });
  }

  if (msg.type === 'campaign:stop') {
    const runner = runners.get(msg.campaignId as string);
    runner?.stop();
    runners.delete(msg.campaignId as string);
    sendResponse({ ok: true });
  }
});
