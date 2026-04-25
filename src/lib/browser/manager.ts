import { BrowserSession } from './session';
import { LinkedInAdapter } from '../adapters/linkedin';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

interface PlatformEntry {
  session: BrowserSession;
  adapter: LinkedInAdapter;
  state: ConnectionState;
  error?: string;
}

interface Store {
  platforms: Map<string, PlatformEntry>;
}

const KEY = '__finetune_browser_manager__';
const g = globalThis as unknown as Record<string, Store>;
const store: Store = g[KEY] ?? (g[KEY] = { platforms: new Map() });

export interface PlatformStatus {
  state: ConnectionState;
  loggedIn: boolean;
  error?: string;
}

export async function getLinkedInStatus(): Promise<PlatformStatus> {
  const entry = store.platforms.get('linkedin');
  if (!entry || !entry.session.isRunning()) {
    return { state: 'disconnected', loggedIn: false };
  }
  let loggedIn = false;
  try {
    loggedIn = await entry.adapter.isLoggedIn();
  } catch {
    loggedIn = false;
  }
  return { state: entry.state, loggedIn, error: entry.error };
}

export async function connectLinkedIn(): Promise<void> {
  const existing = store.platforms.get('linkedin');
  if (existing && existing.session.isRunning()) return;

  const session = new BrowserSession({ platform: 'linkedin', headless: false });
  const context = await session.start();
  const adapter = new LinkedInAdapter(context);
  const entry: PlatformEntry = { session, adapter, state: 'connecting' };
  store.platforms.set('linkedin', entry);

  void (async () => {
    try {
      await adapter.navigateToFeed();
      if (await adapter.isLoggedIn()) {
        entry.state = 'connected';
        return;
      }
      await adapter.awaitLogin();
      entry.state = 'connected';
    } catch (err) {
      entry.state = 'error';
      entry.error = err instanceof Error ? err.message : String(err);
    }
  })();
}

export async function disconnectLinkedIn(): Promise<void> {
  const entry = store.platforms.get('linkedin');
  store.platforms.delete('linkedin');
  if (entry) await entry.session.stop();
}
