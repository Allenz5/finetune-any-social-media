// --- Types ---

type Platform = 'linkedin' | null;

interface Campaign {
  id: string;
  name: string;
  prompt: string;
  running: boolean;
}

interface LogEntry {
  timestamp: number;
  status: 'info' | 'success' | 'error';
  message: string;
}

const MAX_LOG_ENTRIES = 50;
const campaignLogs = new Map<string, LogEntry[]>();

const STORAGE_KEY = 'campaigns';
const API_KEY_STORAGE_KEY = 'openai_api_key';

// --- Storage ---

async function loadCampaigns(): Promise<Campaign[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return (result[STORAGE_KEY] as Campaign[]) ?? [];
}

async function saveCampaigns(campaigns: Campaign[]): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: campaigns });
}

// --- Platform detection (placeholder) ---

async function detectPlatform(): Promise<Platform> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url ?? '';
  if (url.includes('linkedin.com')) return 'linkedin';
  return null;
}

function renderPlatformStatus(platform: Platform) {
  const pill = document.getElementById('platform-status')!;
  if (platform === 'linkedin') {
    pill.textContent = 'Active';
    pill.className = 'status-pill active';
  } else {
    pill.textContent = 'Not detected';
    pill.className = 'status-pill inactive';
  }
}

async function refreshPlatform() {
  const pill = document.getElementById('platform-status')!;
  pill.textContent = 'Detecting…';
  pill.className = 'status-pill';
  renderPlatformStatus(await detectPlatform());
}

// --- Log rendering ---

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function renderLog(campaignId: string) {
  const logEl = document.querySelector<HTMLElement>(`.campaign-log[data-campaign-id="${campaignId}"]`);
  if (!logEl) return;

  const entries = campaignLogs.get(campaignId) ?? [];
  logEl.innerHTML = entries
    .map(e => `<div class="log-entry log-${e.status}">
      <span class="log-time">${formatTime(e.timestamp)}</span>
      <span class="log-msg">${escapeHtml(e.message)}</span>
    </div>`)
    .join('');

  logEl.scrollTop = logEl.scrollHeight;
}

// --- Campaign rendering ---

function renderCampaigns(campaigns: Campaign[]) {
  const list = document.getElementById('campaign-list')!;
  const emptyHint = document.getElementById('empty-hint')!;

  list.innerHTML = '';

  if (campaigns.length === 0) {
    emptyHint.style.display = '';
    return;
  }

  emptyHint.style.display = 'none';

  for (const campaign of campaigns) {
    const card = document.createElement('div');
    card.className = 'campaign-card';
    card.dataset.id = campaign.id;

    const hasLogs = (campaignLogs.get(campaign.id) ?? []).length > 0;
    card.innerHTML = `
      <div class="campaign-card-header">
        <span class="campaign-name">${escapeHtml(campaign.name)}</span>
        <div class="campaign-actions">
          <button class="btn-toggle ${campaign.running ? 'stop' : 'start'}" data-action="toggle">
            ${campaign.running ? 'Stop' : 'Start'}
          </button>
          <button class="btn-delete" data-action="delete">Delete</button>
        </div>
      </div>
      <p class="campaign-prompt">${escapeHtml(campaign.prompt)}</p>
      <div class="campaign-log" data-campaign-id="${campaign.id}" ${!hasLogs && !campaign.running ? 'hidden' : ''}></div>
    `;

    card.querySelector('[data-action="toggle"]')!.addEventListener('click', () =>
      toggleCampaign(campaign.id)
    );
    card.querySelector('[data-action="delete"]')!.addEventListener('click', () =>
      deleteCampaign(campaign.id)
    );

    list.appendChild(card);
    renderLog(campaign.id);
  }
}

// --- Campaign mutations ---

async function toggleCampaign(id: string) {
  const campaigns = await loadCampaigns();
  const campaign = campaigns.find(c => c.id === id);
  if (!campaign) return;

  campaign.running = !campaign.running;
  await saveCampaigns(campaigns);
  renderCampaigns(campaigns);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id) return;

  const message = campaign.running
    ? { type: 'campaign:start', campaign }
    : { type: 'campaign:stop', campaignId: id };

  chrome.tabs.sendMessage(tab.id, message).catch(() => {
    // Content script not available on this tab (not on LinkedIn)
  });
}

async function deleteCampaign(id: string) {
  // TODO: confirm + delete campaign logic
  const campaigns = (await loadCampaigns()).filter(c => c.id !== id);
  await saveCampaigns(campaigns);
  renderCampaigns(campaigns);
}

async function createCampaign(name: string, prompt: string) {
  // TODO: campaign execution logic
  const campaigns = await loadCampaigns();
  campaigns.push({ id: Date.now().toString(), name, prompt, running: false });
  await saveCampaigns(campaigns);
  renderCampaigns(campaigns);
}

// --- New campaign form ---

function showForm() {
  document.getElementById('campaign-form')!.hidden = false;
  (document.getElementById('input-campaign-name') as HTMLInputElement).focus();
}

function hideForm() {
  document.getElementById('campaign-form')!.hidden = true;
  (document.getElementById('input-campaign-name') as HTMLInputElement).value = '';
  (document.getElementById('input-campaign-prompt') as HTMLTextAreaElement).value = '';
}

// --- Utilities ---

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- API key ---

async function loadApiKey(): Promise<string> {
  const result = await chrome.storage.local.get(API_KEY_STORAGE_KEY);
  return (result[API_KEY_STORAGE_KEY] as string) ?? '';
}

async function saveApiKey(key: string): Promise<void> {
  await chrome.storage.local.set({ [API_KEY_STORAGE_KEY]: key });
}

// --- Init ---

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === 'campaign:log') {
    const { campaignId, entry } = msg as { campaignId: string; entry: LogEntry };
    const logs = campaignLogs.get(campaignId) ?? [];
    logs.push(entry);
    if (logs.length > MAX_LOG_ENTRIES) logs.shift();
    campaignLogs.set(campaignId, logs);

    const logEl = document.querySelector<HTMLElement>(`.campaign-log[data-campaign-id="${campaignId}"]`);
    if (logEl) {
      logEl.removeAttribute('hidden');
      renderLog(campaignId);
    }
  }
});

document.getElementById('btn-new-campaign')!.addEventListener('click', showForm);
document.getElementById('btn-cancel-campaign')!.addEventListener('click', hideForm);

document.getElementById('btn-create-campaign')!.addEventListener('click', async () => {
  const name = (document.getElementById('input-campaign-name') as HTMLInputElement).value.trim();
  const prompt = (document.getElementById('input-campaign-prompt') as HTMLTextAreaElement).value.trim();
  if (!name || !prompt) return;
  await createCampaign(name, prompt);
  hideForm();
});

document.getElementById('btn-save-api-key')!.addEventListener('click', async () => {
  const key = (document.getElementById('input-api-key') as HTMLInputElement).value.trim();
  const hint = document.getElementById('api-key-hint')!;
  await saveApiKey(key);
  hint.textContent = 'Saved.';
  setTimeout(() => { hint.textContent = ''; }, 2000);
});

document.getElementById('btn-reload-platform')!.addEventListener('click', refreshPlatform);

refreshPlatform();
loadCampaigns().then(renderCampaigns);
loadApiKey().then(key => {
  if (key) (document.getElementById('input-api-key') as HTMLInputElement).value = key;
});
