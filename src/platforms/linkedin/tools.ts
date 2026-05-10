import { LinkedInAdapter } from './adapter';
import { registerPlatformTools } from '../../lib/tools/registry';

let registered = false;

export function registerLinkedInTools(): void {
  if (registered) return;
  const adapter = new LinkedInAdapter();
  registerPlatformTools('linkedin', {
    getNextPost: () => adapter.getNextPost(),
    like: () => adapter.like(),
    dislike: () => adapter.dislike(),
    skip: () => adapter.skip(),
    scroll: () => adapter.scroll(),
  });
  registered = true;
}
