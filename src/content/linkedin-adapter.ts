import type { PlatformAdapter, Post } from '../lib/adapters/types';

// Action button labels that mark the end of a post's body text
const ACTION_LABELS = new Set(['Like', 'Comment', 'Repost', 'Send']);

// Lines to skip in the post header (between author and body)
const HEADER_SKIP = /^(\d[\d,]*\s*(followers?|connections?)|promoted|following|•|\d+[smhd]w?)/i;

export class LinkedInAdapter implements PlatformAdapter {
  readonly name = 'linkedin';

  private processedIds = new Set<string>();
  private currentElement: Element | null = null;

  async getNextPost(): Promise<Post | null> {
    // Each feed post has data-display-contents="true" and innerText starting with "Feed post"
    const candidates = document.querySelectorAll<HTMLElement>('[data-display-contents="true"]');

    for (const el of candidates) {
      const raw = el.innerText ?? '';
      if (!raw.startsWith('Feed post')) continue;

      const id = hashText(raw.slice(0, 120));
      if (this.processedIds.has(id)) continue;

      const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
      // lines[0] = "Feed post" (aria label)
      // lines[1] = author name
      // lines[2..] = followers count, promoted, etc., then post body

      const author = lines[1] ?? 'Unknown';

      // Skip header noise (follower counts, "Promoted", timestamps, etc.)
      let i = 2;
      while (i < lines.length && HEADER_SKIP.test(lines[i])) i++;

      // Collect body lines until we hit the action buttons
      const bodyLines: string[] = [];
      while (i < lines.length && !ACTION_LABELS.has(lines[i])) {
        bodyLines.push(lines[i]);
        i++;
      }

      const text = bodyLines.join(' ').trim();
      if (!text) continue;

      this.processedIds.add(id);
      this.currentElement = el;
      return { id, author, text };
    }

    return null;
  }

  async like(): Promise<void> {
    const btn = findButton(this.currentElement, 'Like');
    btn?.click();
    await sleep(500);
  }

  async dislike(): Promise<void> {
    // "Not interested" lives behind a "More" / "..." overflow button
    const moreBtn = findButton(this.currentElement, '…') ?? findButton(this.currentElement, 'More');
    if (!moreBtn) return;
    moreBtn.click();
    await sleep(400);

    // The dropdown appears in the document (not scoped to the post)
    const item = findButton(document.body, 'Not interested') ?? findButton(document.body, 'Hide');
    item?.click();
    await sleep(400);
  }

  async skip(): Promise<void> {
    // Post is already marked processed; nothing to click
  }

  async scroll(): Promise<void> {
    this.currentElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    await sleep(600);
    window.scrollBy({ top: 600, behavior: 'smooth' });
    await sleep(800);
  }
}

function findButton(root: Element | null, label: string): HTMLButtonElement | null {
  if (!root) return null;
  const buttons = root.querySelectorAll<HTMLButtonElement>('button');
  return (
    Array.from(buttons).find(
      b =>
        b.innerText.trim() === label ||
        b.getAttribute('aria-label')?.toLowerCase().includes(label.toLowerCase())
    ) ?? null
  );
}

function hashText(text: string): string {
  let h = 0;
  for (let i = 0; i < text.length; i++) {
    h = Math.imul(31, h) + text.charCodeAt(i) | 0;
  }
  return h.toString(36);
}

function sleep(ms: number) {
  return new Promise<void>(resolve => setTimeout(resolve, ms));
}
