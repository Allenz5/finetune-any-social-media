const FEED_URL = 'https://www.linkedin.com/feed/';

type Status = 'on-feed' | 'on-linkedin' | 'off-linkedin';

async function getStatus(): Promise<{ status: Status; url?: string }> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const url = tab?.url ?? '';
  if (!url.startsWith('https://www.linkedin.com/')) {
    return { status: 'off-linkedin', url };
  }
  if (new URL(url).pathname.startsWith('/feed')) {
    return { status: 'on-feed', url };
  }
  return { status: 'on-linkedin', url };
}

function render(status: Status) {
  const statusEl = document.getElementById('status')!;
  const hintEl = document.getElementById('hint')!;
  const openBtn = document.getElementById('open') as HTMLButtonElement;

  switch (status) {
    case 'on-feed':
      statusEl.textContent = 'On LinkedIn feed';
      hintEl.textContent = 'Content script is active on this tab.';
      openBtn.style.display = 'none';
      break;
    case 'on-linkedin':
      statusEl.textContent = 'On LinkedIn (not feed)';
      hintEl.textContent = 'Open the feed to start.';
      openBtn.style.display = '';
      break;
    case 'off-linkedin':
      statusEl.textContent = 'Not on LinkedIn';
      hintEl.textContent = 'Open LinkedIn to start.';
      openBtn.style.display = '';
      break;
  }
}

document.getElementById('open')!.addEventListener('click', async () => {
  await chrome.tabs.create({ url: FEED_URL });
  window.close();
});

getStatus().then(({ status }) => render(status));
