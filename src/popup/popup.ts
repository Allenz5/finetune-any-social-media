// --- Types ---

type Platform = 'linkedin' | null;

interface Campaign {
  id: string;
  name: string;
  prompt: string;
  running: boolean;
}

// --- Platform detection (placeholder) ---

function detectPlatform(): Platform {
  // TODO: query active tab and detect platform
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

// --- Campaign list (placeholder data) ---

const PLACEHOLDER_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Tech news boost',
    prompt: 'Like posts about AI, machine learning, and software engineering. Skip anything political.',
    running: true,
  },
  {
    id: '2',
    name: 'Job hunting',
    prompt: 'Engage with posts about open roles, hiring, and career advice.',
    running: false,
  },
];

let campaigns: Campaign[] = [...PLACEHOLDER_CAMPAIGNS];

function renderCampaigns() {
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
    `;

    card.querySelector('[data-action="toggle"]')!.addEventListener('click', () => {
      toggleCampaign(campaign.id);
    });

    card.querySelector('[data-action="delete"]')!.addEventListener('click', () => {
      deleteCampaign(campaign.id);
    });

    list.appendChild(card);
  }
}

function toggleCampaign(id: string) {
  // TODO: start/stop campaign logic
  const campaign = campaigns.find(c => c.id === id);
  if (campaign) {
    campaign.running = !campaign.running;
    renderCampaigns();
  }
}

function deleteCampaign(id: string) {
  // TODO: confirm + delete campaign
  campaigns = campaigns.filter(c => c.id !== id);
  renderCampaigns();
}

function createCampaign(name: string, prompt: string) {
  // TODO: persist campaign
  const campaign: Campaign = {
    id: Date.now().toString(),
    name,
    prompt,
    running: false,
  };
  campaigns.push(campaign);
  renderCampaigns();
}

// --- New campaign form ---

function showForm() {
  document.getElementById('campaign-form')!.hidden = false;
  (document.getElementById('input-campaign-name') as HTMLInputElement).focus();
}

function hideForm() {
  const form = document.getElementById('campaign-form')!;
  form.hidden = true;
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

// --- Init ---

document.getElementById('btn-new-campaign')!.addEventListener('click', showForm);

document.getElementById('btn-cancel-campaign')!.addEventListener('click', hideForm);

document.getElementById('btn-create-campaign')!.addEventListener('click', () => {
  const name = (document.getElementById('input-campaign-name') as HTMLInputElement).value.trim();
  const prompt = (document.getElementById('input-campaign-prompt') as HTMLTextAreaElement).value.trim();
  if (!name || !prompt) return;
  createCampaign(name, prompt);
  hideForm();
});

renderPlatformStatus(detectPlatform());
renderCampaigns();
