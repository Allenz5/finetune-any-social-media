import { tool } from '@openai/agents';
import { z } from 'zod';
import { getTool } from './registry';
import type { Logger, Platform, ToolName } from './types';

export function buildTools(platform: Platform, names: ToolName[], log: Logger) {
  return names.map(name => buildTool(name, platform, log));
}

function buildTool(name: ToolName, platform: Platform, log: Logger) {
  switch (name) {
    case 'getNextPost':
      return tool({
        name: 'getNextPost',
        description: 'Read the next unread post from the feed. Returns { post: null } when no new posts are visible — call scroll first in that case.',
        parameters: z.object({}),
        execute: async () => {
          const post = await getTool('getNextPost', platform)();
          if (!post) {
            log('info', 'No new posts visible.');
            return { post: null };
          }
          const preview = post.text.length > 80 ? post.text.slice(0, 80) + '…' : post.text;
          log('info', `[${post.id}] ${post.author}: "${preview}"`);
          return { post };
        },
      });
    case 'like':
      return tool({
        name: 'like',
        description: 'Like the current post.',
        parameters: z.object({}),
        execute: async () => {
          await getTool('like', platform)();
          log('success', 'Liked.');
          return 'ok';
        },
      });
    case 'dislike':
      return tool({
        name: 'dislike',
        description: 'Mark the current post as not interested / hide it.',
        parameters: z.object({}),
        execute: async () => {
          await getTool('dislike', platform)();
          log('success', 'Disliked.');
          return 'ok';
        },
      });
    case 'skip':
      return tool({
        name: 'skip',
        description: 'Skip the current post without interacting with it.',
        parameters: z.object({}),
        execute: async () => {
          await getTool('skip', platform)();
          log('info', 'Skipped.');
          return 'ok';
        },
      });
    case 'scroll':
      return tool({
        name: 'scroll',
        description: 'Scroll the feed to load more posts.',
        parameters: z.object({}),
        execute: async () => {
          await getTool('scroll', platform)();
          return 'ok';
        },
      });
  }
}
